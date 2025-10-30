import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  message,
  Card,
  InputNumber,
} from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  FlagOutlined,
} from "@ant-design/icons";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

const { TextArea } = Input;
const { Option } = Select;

const CreateTask = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.USERS);
      setUsers(response.data.filter((user) => user.role === "member"));
    } catch (error) {
      message.error("Failed to fetch users");
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Format the due date
      const formattedValues = {
        ...values,
        dueDate: values.dueDate.toISOString(),
      };

      await axiosInstance.post(API_PATHS.TASKS, formattedValues);
      message.success("Task created successfully");
      navigate("/admin/tasks");
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <Card title="Create New Task" style={{ maxWidth: 800, margin: "0 auto" }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            priority: "medium",
            progress: 0,
          }}
        >
          <Form.Item
            name="title"
            label="Task Title"
            rules={[{ required: true, message: "Please enter task title" }]}
          >
            <Input placeholder="Enter task title" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[
              { required: true, message: "Please enter task description" },
            ]}
          >
            <TextArea rows={4} placeholder="Enter task description" />
          </Form.Item>

          <Form.Item
            name="assignedTo"
            label="Assign To"
            rules={[{ required: true, message: "Please select team member" }]}
          >
            <Select
              placeholder="Select team member"
              allowClear
              suffixIcon={<UserOutlined />}
            >
              {users.map((user) => (
                <Option key={user._id} value={user._id}>
                  {user.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="dueDate"
            label="Due Date"
            rules={[{ required: true, message: "Please select due date" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              suffixIcon={<CalendarOutlined />}
              disabledDate={(current) =>
                current && current.valueOf() < Date.now()
              }
            />
          </Form.Item>

          <Form.Item
            name="priority"
            label="Priority"
            rules={[{ required: true, message: "Please select priority" }]}
          >
            <Select suffixIcon={<FlagOutlined />}>
              <Option value="low">Low</Option>
              <Option value="medium">Medium</Option>
              <Option value="high">High</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="progress"
            label="Initial Progress"
            rules={[
              { required: true, message: "Please set initial progress" },
              {
                type: "number",
                min: 0,
                max: 100,
                message: "Progress must be between 0 and 100",
              },
            ]}
          >
            <InputNumber style={{ width: "100%" }} min={0} max={100} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Create Task
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateTask;
