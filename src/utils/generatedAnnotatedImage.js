// const { createCanvas, loadImage } = require("canvas");
// const fs = require("fs");
// const path = require("path");

// const generateAnnotatedImage = async (tileId, annotations, originalImagePath) => {
//     try {
//         const image = await loadImage(originalImagePath);
//         const canvas = createCanvas(image.width, image.height);
//         const ctx = canvas.getContext("2d");

//         ctx.drawImage(image, 0, 0);
//         ctx.strokeStyle = "red";
//         ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
//         ctx.lineWidth = 2;

//         annotations.forEach((annotation) => {
//             const { type, points } = annotation;

//             if (type === "point" && points[0]) {
//                 const { x, y } = points[0];
//                 ctx.beginPath();
//                 ctx.arc(x, y, 5, 0, Math.PI * 2);
//                 ctx.fill();
//             }

//             if (type === "polygon" && points.length > 0) {
//                 ctx.beginPath();
//                 points.forEach((point, idx) => {
//                     if (idx === 0) ctx.moveTo(point.x, point.y);
//                     else ctx.lineTo(point.x, point.y);
//                 });
//                 ctx.closePath();
//                 ctx.stroke();
//                 ctx.fill();
//             }
//         });

//         // ✅ Save in `public/annotated_tiles`
//         const outputFile = `annotated_${tileId}.png`;
//         const annotatedPath = path.join(process.cwd(), "public", "annotated_tiles", outputFile);

//         console.log("📝 Will save annotated image to:", annotatedPath);

//         fs.mkdirSync(path.dirname(annotatedPath), { recursive: true });

//         const out = fs.createWriteStream(annotatedPath);
//         const stream = canvas.createPNGStream();
//         stream.pipe(out);

//         return new Promise((resolve, reject) => {
//             out.on("finish", () => {
//                 console.log("✅ Annotated image saved:", annotatedPath);
//                 // ✅ Return correct public URL
//                 resolve(`/annotated_tiles/${outputFile}`);
//             });
//             out.on("error", (err) => {
//                 console.error("❌ Error writing annotated image:", err);
//                 reject(err);
//             });
//         });
//     } catch (error) {
//         console.error("❌ generateAnnotatedImage failed:", error.message);
//         return null;
//     }
// };

// module.exports = generateAnnotatedImage;



const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

const generateAnnotatedImage = async (tileId, annotations, originalImagePath) => {
  try {
    const image = await loadImage(originalImagePath);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(image, 0, 0);

    ctx.strokeStyle = "red";
    ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
    ctx.lineWidth = 2;

    annotations.forEach((annotation, index) => {
      const { type, points } = annotation;

      if (!points || points.length === 0) {
        console.warn(`⚠️ No points found in annotation #${index}`, annotation);
        return;
      }

      if (type === "point") {
        const { x, y } = points[0];
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
        console.log(`🖍️ Drew point at (${x}, ${y})`);
      }

      if (type === "polygon") {
        ctx.beginPath();
        points.forEach((point, idx) => {
          if (idx === 0) ctx.moveTo(point.x, point.y);
          else ctx.lineTo(point.x, point.y);
        });
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
        console.log(`🖍️ Drew polygon with ${points.length} points`);
      }
    });

    const outputFile = `annotated_${tileId}_${Date.now()}.png`;
    const annotatedPath = path.join(process.cwd(), "public", "annotated_tiles", outputFile);

    console.log("📝 Will save annotated image to:", annotatedPath);

    fs.mkdirSync(path.dirname(annotatedPath), { recursive: true });

    const out = fs.createWriteStream(annotatedPath);
    const stream = canvas.createPNGStream();
    stream.pipe(out);

    return new Promise((resolve, reject) => {
      out.on("finish", () => {
        console.log("✅ Annotated image saved:", annotatedPath);
        resolve(`/annotated_tiles/${outputFile}`);
      });
      out.on("error", (err) => {
        console.error("❌ Error writing annotated image:", err);
        reject(err);
      });
    });
  } catch (error) {
    console.error("❌ generateAnnotatedImage failed:", error.message);
    return null;
  }
};

module.exports = generateAnnotatedImage;
