// const axios = require("axios");


// exports.complainCreate = (firstName, mobile, complainId,wmemberphone) => {
//     const message = encodeURIComponent(`नमस्कार ${firstName} कंपनी MI2C परिवार से सम्पर्क करने के लिए आपका स्वागत है।\n हम किस तरह से आपकी सेवा कर सकते है। आपकी शिकायत सं० ${complainId} है। शिकायत निस्तारण हेतु सुपरवाइजर नं० ${wmemberphone} जल्द ही आपसे संपर्क करेगा। धन्यवाद टीम MI2C`);
//   const queryParams = new URLSearchParams({
//     user: process.env.SENDERID,
//     key:  process.env.KEY,
//     mobile: mobile, 
//     message: message,
//     senderid:  process.env.SENDERID,
//     accusage:  process.env.ACCUSAGE,
//     entityid:  process.env.ENTITYID,
//     tempid:  process.env.TEMPIDCREATE,
//   });

//   const url = `http://202.143.96.245/submitsms.jsp?${queryParams.toString()}`;
//   console.log("Final URL for complainCreate:", url);
//   axios
//     .get(url)
//     .then((response) => {
//       console.log("Status Code:", response.status);
//       console.log("Response Data:", response.data);
//     })
//     .catch((error) => {
//       console.error("Error:", error.message);
//     });
// };

// exports.complainClose = (firstName, mobile, complainId) => {
//     const message = encodeURIComponent(`नमस्ते, ${firstName},हम MI2C सिक्योरिटी एंड फैसिलिटीज़ प्रा. लि. की ओर से, NPP मुजफ्फरनगर की ओर से यह संदेश भेज रहे हैं ताकि आपको सूचित किया जा सके कि आपकी शिकायत टिकट संख्या ${complainId} का समाधान कर दिया गया है और इसे बंद कर दिया गया है। धन्यवाद। टीम MI2C`);
//     const queryParams = new URLSearchParams({
//       user:  process.env.SENDERID,
//       key:  process.env.KEY,
//       mobile: mobile,
//       message: message,
//       senderid: process.env.SENDERID,
//       accusage:  process.env.ACCUSAGE,
//       entityid:  process.env.ENTITYID,
//       tempid:  process.env.TEMPIDClOSE,
//     });
  
//     const url = `http://202.143.96.245/submitsms.jsp?${queryParams.toString()}`;
//     console.log("Final URL for complainCreate:", url);
//     axios
//       .get(url)
//       .then((response) => {
//         console.log("Status Code:", response.status);
//         console.log("Response Data:", response.data);
//       })
//       .catch((error) => {
//         console.error("Error:", error.message);
//       });
//   }


