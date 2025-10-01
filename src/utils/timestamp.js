const timestamper = () => {
  return new Date().toLocaleString( 'en-GB', {
		timeZone: process.env.TZ
	});
};

export default timestamper;