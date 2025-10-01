const timestamper = () => {
  return new Date().toLocaleString( process.env.LOCALE, {
		timeZone: process.env.TZ
	});
};

export default timestamper;