let users: any[] = [];

const addUser = (userId: any, roomId: any) => {
  const isExist = users.find((u) => u.userId === userId);

  !isExist && users.push({ userId, roomId });

  const currentUser = isExist || { userId, roomId };
  return { isExist: !!isExist, user: currentUser };
};

export { addUser };
