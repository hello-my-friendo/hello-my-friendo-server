interface FriendRequest {
  id: string;
  from: string;
  to: string;
  seen: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export {FriendRequest};
