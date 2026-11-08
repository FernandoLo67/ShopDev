import { useState, useEffect, useCallback } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '../../api/users';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const EMPTY_FORM = { nombre: '', email: '', password: '', rol: 'CLIENTE' };

const ROLE_STYLES = {
  ADMIN: 'bg-purple-100 text-purple-800',
  CLIENTE: 'bg-gray-100 text-gray-700',
};

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getUsers({ page, limit: 10 });
      setUsers(res.data || []);
      setPagination({
        page: res.pagination?.page || 1,
        totalPages: res.pagination?.totalPages || 1,
      });
    } catch (err) {
      addToast(err.message, 'error');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [page, addToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      nombre: row.nombre || '',
      email: row.email || '',
      password: '',
      rol: row.rol || 'CLIENTE',
    });
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
    const email = form.email.trim();

    if (nombre.length < 2) next.nombre = 'El nombre es obligatorio';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Email no valido';

    if (!editing) {
      if (form.password.length < 8 || form.password.length > 72) {
        next.password = 'La contrasena debe tener entre 8 y 72 caracteres';
      }
    } else if (form.password && (form.password.length < 8 || form.password.length > 72)) {
      next.password = 'La contrasena debe tener entre 8 y 72 caracteres';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!validate()) return;

    try {
      setSaving(true);
      if (editing) {
        const payload = {};
        const nombre = form.nombre.trim();
        const email = form.email.trim();
        if (nombre !== editing.nombre) payload.nombre = nombre;
        if (email !== editing.email) payload.email = email;
        if (form.rol !== editing.rol) payload.rol = form.rol;
        if (form.password) payload.password = form.password;

        if (Object.keys(payload).length === 0) {
          setFormError('No hay cambios para guardar');
          return;
        }

        await updateUser(editing.id, payload);
        addToast('Usuario actualizado', 'success');
      } else {
        await createUser({
          nombre: form.nombre.trim(),
          email: form.email.trim(),
          password: form.password,
          rol: form.rol,
        });
        addToast('Usuario creado', 'success');
      }
      closeModal();
      fetchUsers();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await deleteUser(deleting.id);
      addToast('Usuario eliminado', 'success');
      setDeleting(null);
      fetchUsers();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    {
      key: 'nombre',
      label: 'Nombre',
      render: (row) => <span className="font-medium text-gray-900">{row.nombre}</span>,
    },
    { key: 'email', label: 'Email' },
    {
      key: 'rol',
      label: 'Rol',
      render: (row) => (
        <span
          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
            ROLE_STYLES[row.rol] || ROLE_STYLES.CLIENTE
          }`}
        >
          {row.rol}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Registro',
      render: (row) => new Date(row.createdAt).toLocaleDateString('es-ES'),
    },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (row) => {
        const isSelf = row.id === currentUser?.id;
        return (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => openEdit(row)}>
              Editar
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={isSelf}
              onClick={() => setDeleting(row)}
              title={isSelf ? 'No puedes eliminar tu propia cuenta' : 'Eliminar usuario'}
            >
              Eliminar
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-2xl font-bold text-gray-900">Usuarios</h2>
        <Button size="sm" onClick={openCreate}>
          Nuevo usuario
        </Button>
      </div>

      <Table
        columns={columns}
        data={users}
        loading={loading}
        emptyMessage="No hay usuarios registrados"
      />

      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={setPage}
      />

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editing ? 'Editar usuario' : 'Nuevo usuario'}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={closeModal} disabled={saving}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSubmit} loading={saving}>
              {editing ? 'Guardar cambios' : 'Crear usuario'}
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
            id="user-nombre"
            label="Nombre"
            value={form.nombre}
            onChange={(e) => setField('nombre', e.target.value)}
            error={errors.nombre}
            placeholder="Nombre completo"
          />

          <Input
            id="user-email"
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setField('email', e.target.value)}
            error={errors.email}
            placeholder="correo@ejemplo.com"
          />

          <Input
            id="user-password"
            label="Contrasena"
            type="password"
            value={form.password}
            onChange={(e) => setField('password', e.target.value)}
            error={errors.password}
            placeholder={editing ? 'Dejar vacio para no cambiar' : 'Minimo 8 caracteres'}
          />

          <div>
            <label htmlFor="user-rol" className="block text-sm font-medium text-gray-700 mb-1">
              Rol
            </label>
            <select
              id="user-rol"
              value={form.rol}
              onChange={(e) => setField('rol', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
            >
              <option value="CLIENTE">CLIENTE</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Eliminar usuario"
        message={`Seguro que quieres eliminar a "${deleting?.nombre}"? Esta accion no se puede deshacer.`}
        loading={deleteLoading}
      />
    </div>
  );
}
