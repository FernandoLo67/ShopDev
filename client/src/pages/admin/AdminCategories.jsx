import { useState, useEffect, useCallback } from 'react';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../api/categories';
import { useToast } from '../../context/ToastContext';
import { resolveImageUrl } from '../../utils/imageUrl';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const EMPTY_FORM = { nombre: '', imagen: '' };

export default function AdminCategories() {
  const { addToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getCategories();
      setCategories(res.data || []);
    } catch (err) {
      addToast(err.message, 'error');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (category) => {
    setEditing(category);
    setForm({ nombre: category.nombre || '', imagen: category.imagen || '' });
    setErrors({});
    setFormError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const nombre = form.nombre.trim();
    if (!nombre) {
      setErrors({ nombre: 'El nombre es obligatorio' });
      return;
    }
    setErrors({});

    const payload = { nombre };
    const imagen = form.imagen.trim();
    if (imagen) payload.imagen = imagen;

    try {
      setSaving(true);
      if (editing) {
        await updateCategory(editing.id, payload);
        addToast('Categoria actualizada', 'success');
      } else {
        await createCategory(payload);
        addToast('Categoria creada', 'success');
      }
      closeModal();
      fetchCategories();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await deleteCategory(deleting.id);
      addToast('Categoria eliminada', 'success');
      setDeleting(null);
      fetchCategories();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    {
      key: 'imagen',
      label: 'Imagen',
      render: (row) =>
        row.imagen ? (
          <img
            src={resolveImageUrl(row.imagen)}
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
      key: 'slug',
      label: 'Slug',
      render: (row) => <span className="text-gray-500">{row.slug}</span>,
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
        <h2 className="text-2xl font-bold text-gray-900">Categorias</h2>
        <Button size="sm" onClick={openCreate}>
          Nueva categoria
        </Button>
      </div>

      <Table
        columns={columns}
        data={categories}
        loading={loading}
        emptyMessage="No hay categorias registradas"
      />

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editing ? 'Editar categoria' : 'Nueva categoria'}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={closeModal} disabled={saving}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSubmit} loading={saving}>
              {editing ? 'Guardar cambios' : 'Crear categoria'}
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
            id="cat-nombre"
            label="Nombre"
            value={form.nombre}
            onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))}
            error={errors.nombre}
            placeholder="Nombre de la categoria"
          />

          <Input
            id="cat-imagen"
            label="Imagen (URL)"
            value={form.imagen}
            onChange={(e) => setForm((prev) => ({ ...prev, imagen: e.target.value }))}
            placeholder="https://..."
          />

          <p className="text-xs text-gray-400">
            El slug se genera automaticamente a partir del nombre.
          </p>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Eliminar categoria"
        message={`Seguro que quieres eliminar "${deleting?.nombre}"? No se puede eliminar una categoria que tenga productos asociados.`}
        loading={deleteLoading}
      />
    </div>
  );
}
