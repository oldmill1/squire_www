export const load = async ({ params }: { params: { path: string[] } }) => {
	return {
		path: params.path || []
	};
};
