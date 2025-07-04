// controllers/trackingController.js
import Campaign from '../models/campaign.js';

export const trackOpen = async (req, res) => {
  try {
    const { id } = req.params;

    // Device detection
    const ua = req.headers['user-agent'] || '';
    const isMobile = /mobile/i.test(ua);

    // Update opened count and device-specific stats
    await Campaign.findByIdAndUpdate(id, {
      $inc: {
        'stats.opened': 1,
        [`stats.${isMobile ? 'mobile' : 'desktop'}`]: 1
      }
    });

    // return a 1x1 transparent pixel
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
    await Campaign.findByIdAndUpdate(id, {
      $inc: { 'stats.clicks': 1 }
    });
    res.redirect(redirect || 'https://example.com');
  } catch (err) {
    console.error("Click tracking failed", err);
    res.sendStatus(500);
  }
};
