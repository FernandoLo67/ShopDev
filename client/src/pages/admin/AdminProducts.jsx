import { useState, useEffect, useCallback } from 'react';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../../api/products';
import { getCategories } from '../../api/categories';
import { useToast } from '../../context/ToastContext';
import { formatPrice } from '../../utils/formatPrice';
import { resolveImageUrl } from '../../utils/imageUrl';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const EMPTY_FORM = {
  nombre: '',
  descripcion: '',
  precio: '',
  stock: '',
  categoryId: '',
};

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function AdminProducts() {
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (search) params.search = search;
      const res = await getProducts(params);
      setProducts(res.data || []);
      setPagination({
        page: res.pagination?.page || 1,
        totalPages: res.pagination?.totalPages || 1,
      });
    } catch (err) {
      addToast(err.message, 'error');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, addToast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.data || []))
      .catch(() => {});
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFile(null);
    setErrors({});
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      nombre: product.nombre || '',
      descripcion: product.descripcion || '',
      precio: String(product.precio ?? ''),
      stock: String(product.stock ?? ''),
      categoryId: String(product.categoryId ?? ''),
    });
    setFile(null);
    setErrors({});
    setFormError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    const next = {};
    const nombre = form.nombre.trim();
    const descripcion = form.descripcion.trim();
    const precio = Number(form.precio);
    const stock = Number(form.stock);

    if (nombre.length < 2 || nombre.length > 200) {
      next.nombre = 'El nombre debe tener entre 2 y 200 caracteres';
    }
    if (descripcion.length < 1 || descripcion.length > 5000) {
      next.descripcion = 'La descripcion debe tener entre 1 y 5000 caracteres';
    }
    if (!form.precio || Number.isNaN(precio) || precio < 0.01 || precio > 99999999.99) {
      next.precio = 'El precio debe estar entre 0.01 y 99999999.99';
    } else if (!/^\d+(\.\d{1,2})?$/.test(form.precio.trim())) {
      next.precio = 'El precio admite maximo 2 decimales';
    }
    if (form.stock === '' || !Number.isInteger(stock) || stock < 0) {
      next.stock = 'El stock debe ser un entero mayor o igual a 0';
    }
    if (!form.categoryId) {
      next.categoryId = 'Selecciona una categoria';
    }
    if (file && !ACCEPTED_TYPES.includes(file.type)) {
      next.imagen = 'Formato no permitido. Usa JPEG, PNG o WEBP';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!validate()) return;

    const formData = new FormData();
    formData.append('nombre', form.nombre.trim());
    formData.append('descripcion', form.descripcion.trim());
    formData.append('precio', form.precio.trim());
    formData.append('stock', form.stock);
    formData.append('categoryId', form.categoryId);
    if (file) formData.append('imagen', file);

    try {
      setSaving(true);
      if (editing) {
        await updateProduct(editing.id, formData);
        addToast('Producto actualizado', 'success');
      } else {
        await createProduct(formData);
        addToast('Producto creado', 'success');
      }
      closeModal();
      fetchProducts();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await deleteProduct(deleting.id);
      addToast('Producto eliminado', 'success');
      setDeleting(null);
      fetchProducts();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const stockClass = (stock) => {
    if (stock === 0) return 'text-red-600 font-semibold';
    if (stock < 10) return 'text-amber-600 font-semibold';
    return 'text-gray-700';
  };

  const columns = [
    {
      key: 'imagen',
      label: 'Imagen',
      render: (row) =>
        row.imagenUrl ? (
          <img
            src={resolveImageUrl(row.imagenUrl)}
            alt={row.nombre}
            className="w-12 h-12 rounded-lg object-cover border border-gray-200"
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] text-gray-400">
            Sin imagen
          </div>
        ),
    },
    {
      key: 'nombre',
      label: 'Nombre',
      render: (row) => <span className="font-medium text-gray-900">{row.nombre}</span>,
    },
    {
      key: 'categoria',
      label: 'Categoria',
      render: (row) => row.category?.nombre || '-',
    },
    { key: 'precio', label: 'Precio', render: (row) => formatPrice(row.precio) },
    {
      key: 'stock',
      label: 'Stock',
      render: (row) => <span className={stockClass(row.stock)}>{row.stock}</span>,
    },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (row) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => openEdit(row)}>
            Editar
          </Button>
          <Button variant="danger" size="sm" onClick={() => setDeleting(row)}>
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-2xl font-bold text-gray-900">Productos</h2>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar productos..."
              className="flex-1 sm:w-56 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <Button type="submit" variant="outline" size="sm">
              Buscar
            </Button>
          </form>
          <Button size="sm" onClick={openCreate}>
            Nuevo producto
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        data={products}
        loading={loading}
        emptyMessage="No se encontraron productos"
      />

      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={setPage}
      />

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editing ? 'Editar producto' : 'Nuevo producto'}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={closeModal} disabled={saving}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSubmit} loading={saving}>
              {editing ? 'Guardar cambios' : 'Crear producto'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="px-3 py-2 rounded-lg bg-red-50 text-sm text-red-700 border border-red-200">
              {formError}
            </div>
          )}

          <Input
            id="nombre"
            label="Nombre"
            value={form.nombre}
            onChange={(e) => setField('nombre', e.target.value)}
            error={errors.nombre}
            placeholder="Nombre del producto"
          />

          <div>
            <label
              htmlFor="descripcion"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Descripcion
            </label>
            <textarea
              id="descripcion"
              rows={4}
              value={form.descripcion}
              onChange={(e) => setField('descripcion', e.target.value)}
              placeholder="Descripcion del producto"
              className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors ${
                errors.descripcion ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.descripcion && (
              <p className="mt-1 text-sm text-red-600">{errors.descripcion}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="precio"
              label="Precio"
              type="number"
              step="0.01"
              min="0.01"
              value={form.precio}
              onChange={(e) => setField('precio', e.target.value)}
              error={errors.precio}
              placeholder="0.00"
            />
            <Input
              id="stock"
              label="Stock"
              type="number"
              step="1"
              min="0"
              value={form.stock}
              onChange={(e) => setField('stock', e.target.value)}
              error={errors.stock}
              placeholder="0"
            />
          </div>

          <div>
            <label
              htmlFor="categoryId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Categoria
            </label>
            <select
              id="categoryId"
              value={form.categoryId}
              onChange={(e) => setField('categoryId', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors ${
                errors.categoryId ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Selecciona una categoria</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>
            )}
          </div>

          <div>
            <label htmlFor="imagen" className="block text-sm font-medium text-gray-700 mb-1">
              Imagen
            </label>
            {editing?.imagenUrl && !file && (
              <img
                src={resolveImageUrl(editing.imagenUrl)}
                alt={editing.nombre}
                className="w-20 h-20 rounded-lg object-cover border border-gray-200 mb-2"
              />
            )}
            <input
              id="imagen"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
            />
            {errors.imagen && <p className="mt-1 text-sm text-red-600">{errors.imagen}</p>}
            {editing && (
              <p className="mt-1 text-xs text-gray-400">
                Deja vacio para conservar la imagen actual
              </p>
            )}
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Eliminar producto"
        message={`Seguro que quieres eliminar "${deleting?.nombre}"? Esta accion no se puede deshacer.`}
        loading={deleteLoading}
      />
    </div>
  );
}
