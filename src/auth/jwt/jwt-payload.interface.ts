export interface JwtPayload {
  user: {
    id: number;
    role_id: number;
  };
}

export interface ShopJwtPayload {
  user: {
    id: number;
    role_id: number;
  };
  shop_id: number;
}
