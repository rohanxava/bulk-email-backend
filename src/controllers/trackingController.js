// controllers/trackingController.js
import Campaign from '../models/campaign.js';

export const trackOpen = async (req, res) => {
  try {
    const { id } = req.params;
    const ua = req.headers['user-agent'] || '';
    const isMobile = /mobile/i.test(ua);

    await Campaign.findByIdAndUpdate(id, {
      $inc: {
        'stats.opened': 1,
        [`stats.${isMobile ? 'mobile' : 'desktop'}`]: 1
      }
    });

    const pixel = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=",
      "base64"
    );
    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': pixel.length
    });
    res.end(pixel);
  } catch (err) {
    console.error("Open tracking failed", err);
    res.sendStatus(500);
  }
};



export const trackClick = async (req, res) => {
  try {
    const { id } = req.params;
    const { redirect } = req.query;

    // Validate redirect URL
    const safeRedirect = redirect?.startsWith('http') ? redirect : 'https://example.com';

    // Increment click count
    await Campaign.findByIdAndUpdate(id, {
      $inc: { 'stats.clicks': 1 }
    });

    // Redirect the user to the original link
    res.redirect(safeRedirect);
  } catch (err) {
    console.error("❌ Click tracking failed:", err);
    res.sendStatus(500);
  }
};