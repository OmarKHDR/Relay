export const errorWrapper = (controller) => {
	return async (req, res, next) => {
		try {
			const result = await controller(req, res, next);
			res.send({
				success: true, 
				data: result,
			})
		} catch(err) {
			next(err);
		}
	}
}

export const resultDefinedWrapper = (controller) => {
	return async (req, res, next) => {
		const result = await controller(req, res, next);
		if (result === undefined) {
			throw new Error('result is not defined');
		}
		return result;
	}
}

export const globalControllerWrapper = (controller) => {
	return errorWrapper(
		resultDefinedWrapper(controller)
	);
}