import { WorkloadOperation } from './types';

export const ECOMMERCE_OPERATIONS: WorkloadOperation[] = [
  {
    name: 'Search Catalog',
    weight: 25,
    method: 'GET',
    pathTemplate: () => {
      const terms = ['Cloud', 'SSD', 'Monitor', 'Router', 'Power'];
      const q = terms[Math.floor(Math.random() * terms.length)];
      return `/api/ecommerce/products/search?q=${q}`;
    },
  },
  {
    name: 'List Products',
    weight: 25,
    method: 'GET',
    pathTemplate: () => '/api/ecommerce/products',
  },
  {
    name: 'View Product Detail',
    weight: 20,
    method: 'GET',
    pathTemplate: (vUserId) => {
      const pIdx = (parseInt(vUserId, 36) % 5) + 1;
      return `/api/ecommerce/products/prod-${pIdx}`;
    },
  },
  {
    name: 'Add Item to Cart',
    weight: 15,
    method: 'POST',
    pathTemplate: () => '/api/ecommerce/cart',
    bodyFactory: (vUserId) => ({
      userId: `user-${vUserId}`,
      productId: `prod-${(parseInt(vUserId, 36) % 5) + 1}`,
      quantity: Math.floor(Math.random() * 3) + 1,
    }),
  },
  {
    name: 'Process Checkout',
    weight: 10,
    method: 'POST',
    pathTemplate: () => '/api/ecommerce/checkout',
    bodyFactory: (vUserId) => ({
      userId: `user-${vUserId}`,
      cartId: `cart-${vUserId}`,
    }),
  },
  {
    name: 'Get Order History',
    weight: 5,
    method: 'GET',
    pathTemplate: (vUserId) => `/api/ecommerce/orders?userId=user-${vUserId}`,
  },
];
