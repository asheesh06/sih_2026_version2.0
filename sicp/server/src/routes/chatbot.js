const express = require("express");
const router = express.Router();

const ANSWERS = {
  en: {
    submit: "Go to 'Report a Problem', describe the issue and add a photo if you can. The AI will suggest the right category automatically.",
    status: "Open 'My Reports' and tap your problem — you'll see its exact stage on the tracker.",
    time: "It varies by case — government review usually takes a few days, and the full journey can take a few weeks to months.",
    default: "I can help you report a problem, check its status, or explain how the portal works. Could you tell me a bit more?",
  },
  hi: {
    submit: "'समस्या दर्ज करें' पर जाएँ, विवरण लिखें और फोटो जोड़ें। एआई अपने आप सही श्रेणी सुझाएगा।",
    status: "'मेरी रिपोर्ट' में जाकर अपनी समस्या पर टैप करें — वहाँ चरण-दर-चरण स्थिति दिखेगी।",
    time: "हर मामला अलग होता है — सरकारी समीक्षा में आमतौर पर कुछ दिन लगते हैं, और पूरी प्रक्रिया में कुछ सप्ताह से महीने लग सकते हैं।",
    default: "मैं समस्या दर्ज करने, स्थिति जांचने, या पोर्टल कैसे काम करता है — इसमें मदद कर सकता हूँ। कृपया विस्तार से पूछें।",
  },
  khortha: {
    submit: "'समस्या दरज करा' में जाके समस्या लिखल करा आउर फोटो सटा दिहा। एआई अपने-आप सही कैटिगरी बताइ देत।",
    status: "'हमर रिपोर्ट' में जाके अपन समस्या देखल करा — वहाँ एके-एक कदम के हाल मालूम चलत।",
    time: "हर समस्या के अलग समय लागे हे — सरकारी जाँच में कुछ दिन लागे हे, आउर पूरा काम होवे में कुछ हफ्ता से महिना लइग सकत हे।",
    default: "हम समस्या दरज करे में, हाल-चाल जाने में, चाहे पोर्टल के बुझे में मदद कर सकब। का पूछेक हे, कहल जा?",
  },
};

router.post("/", (req, res) => {
  const { message = "", lang = "en" } = req.body || {};
  const q = message.toLowerCase();
  const a = ANSWERS[lang] || ANSWERS.en;
  let reply = a.default;
  if (/submit|report|complain|दर्ज|दरज|शिकायत/.test(q)) reply = a.submit;
  else if (/status|track|स्थिति|हाल/.test(q)) reply = a.status;
  else if (/time|कब|कितने|कतेक|long/.test(q)) reply = a.time;
  res.json({ reply });
});

module.exports = router;
