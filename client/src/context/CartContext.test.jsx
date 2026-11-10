import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import * as cartApi from '../api/cart';
import { CartProvider, useCart } from './CartContext';

vi.mock('../api/cart', () => ({
  getCart: vi.fn(),
  addCartItem: vi.fn(),
  updateCartItem: vi.fn(),
  removeCartItem: vi.fn(),
}));

// El usuario debe ser la misma referencia en cada render, como en el
// AuthContext real; si no, el efecto del carrito se dispara en bucle.
const mockAuth = vi.hoisted(() => ({ value: { user: { id: 1, nombre: 'Ana' } } }));

vi.mock('./AuthContext', () => ({
  useAuth: () => mockAuth.value,
}));

const LINEAS = [
  { id: 5, productId: 3, cantidad: 2, product: { id: 3, nombre: 'Camiseta', precio: '19.99' } },
  { id: 6, productId: 4, cantidad: 1, product: { id: 4, nombre: 'Lampara', precio: '34.95' } },
];

const montar = async () => {
  cartApi.getCart.mockResolvedValue({ data: { items: LINEAS } });
  const hook = renderHook(() => useCart(), { wrapper: CartProvider });
  await waitFor(() => expect(hook.result.current.items).toHaveLength(2));
  return hook;
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe('CartContext con usuario autenticado', () => {
  it('carga el carrito del servidor y calcula cantidad y total', async () => {
    const { result } = await montar();

    expect(result.current.itemCount).toBe(3);
    expect(result.current.total).toBeCloseTo(19.99 * 2 + 34.95, 2);
  });

  it('resetCart vacia el estado local', async () => {
    const { result } = await montar();

    act(() => result.current.resetCart());

    expect(result.current.items).toEqual([]);
    expect(result.current.itemCount).toBe(0);
    expect(result.current.total).toBe(0);
  });

  // Regresion: al crear un pedido el servidor ya vacia el carrito. Borrar cada
  // linea por API devolvia 404 "Item no encontrado", el checkout lo mostraba
  // como fallo de pago y el cliente quedaba cobrado sin ver la confirmacion.
  it('resetCart NO llama a la API: el servidor ya vacio el carrito al crear el pedido', async () => {
    const { result } = await montar();

    act(() => result.current.resetCart());

    expect(cartApi.removeCartItem).not.toHaveBeenCalled();
  });

  it('removeItem si borra por API y recarga el carrito', async () => {
    const { result } = await montar();
    cartApi.removeCartItem.mockResolvedValue({});
    cartApi.getCart.mockResolvedValue({ data: { items: [LINEAS[1]] } });

    await act(async () => {
      await result.current.removeItem(5);
    });

    expect(cartApi.removeCartItem).toHaveBeenCalledWith(5);
    await waitFor(() => expect(result.current.items).toHaveLength(1));
  });

  it('addItem envia el producto a la API y recarga', async () => {
    const { result } = await montar();
    cartApi.addCartItem.mockResolvedValue({});

    await act(async () => {
      await result.current.addItem(9, 2);
    });

    expect(cartApi.addCartItem).toHaveBeenCalledWith(9, 2);
  });
});
