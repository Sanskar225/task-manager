import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Button,
  Space,
  Popconfirm,
  message,
  Tag,
  Modal,
  Form,
  Input,
  Select
} from 'antd';
import {
  UserAddOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  MailOutlined,
  LockOutlined
} from '@ant-design/icons';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';

const { Option } = Select;

const ManageUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(API_PATHS.USERS);
      setUsers(response.data);
    } catch (error) {
      message.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    try {
      await axiosInstance.delete(API_PATHS.USER_BY_ID(userId));
      message.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      message.error('Failed to delete user');
    }
  };

  const showModal = (user = null) => {
    setEditingUser(user);
    if (user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleModalOk = () => {
    form.submit();
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingUser(null);
    form.resetFields();
  };

  const onFinish = async (values) => {
    try {
      if (editingUser) {
        await axiosInstance.put(API_PATHS.USER_BY_ID(editingUser._id), values);
        message.success('User updated successfully');
      } else {
        await axiosInstance.post(API_PATHS.USERS, values);
        message.success('User created successfully');
      }
      handleModalCancel();
      fetchUsers();
    } catch (error) {
      message.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'admin' ? 'red' : 'blue'}>
          {role.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this user?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="primary" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title="Manage Users"
        extra={
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={() => showModal()}
          >
            Add User
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={users}
          rowKey="_id"
          loading={loading}
        />
      </Card>

      <Modal
        title={editingUser ? 'Edit User' : 'Add User'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText={editingUser ? 'Update' : 'Create'}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ role: 'member' }}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter name' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Enter name" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Enter email" />
          </Form.Item>

          {!editingUser && (
            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: 'Please enter password' },
                { min: 6, message: 'Password must be at least 6 characters' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter password"
              />
            </Form.Item>
          )}

          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select role' }]}
          >
            <Select>
              <Option value="member">Member</Option>
              <Option value="admin">Admin</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageUser;
