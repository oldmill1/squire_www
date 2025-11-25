export const load = async ({ params }: { params: { list_id: string } }) => {
	return {
		listId: params.list_id
	};
};
