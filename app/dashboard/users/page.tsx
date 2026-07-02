"use client";
import CustomTable from "@/app/components/ui/CustomTable";

export default function Page() {
  // Example usage
  const columns = [
    {
      title: "ID",
      dataIndex: "key",
      key: "key",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a: any, b: any) => a.name.localeCompare(b.name),
    },
    {
      title: "Age",
      dataIndex: "age",
      key: "age",
      sorter: (a: any, b: any) => a.age - b.age,
    },
    {
      title: "City",
      dataIndex: "city",
      key: "city",
      sorter: (a: any, b: any) => a.city.localeCompare(b.city),
    },
    {
      title: "Salary",
      dataIndex: "salary",
      key: "salary",
      sorter: (a: any, b: any) => a.salary - b.salary,
      render: (salary: number) => `$${salary.toLocaleString()}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "Active", value: "Active" },
        { text: "Inactive", value: "Inactive" },
      ],
      onFilter: (value: any, record: any) => record.status === value,
    },
  ];

  const sampleData = [
    {
      key: 1,
      name: "John Doe",
      age: 28,
      city: "New York",
      salary: 75000,
      status: "Active",
    },
    {
      key: 2,
      name: "Emma Watson",
      age: 24,
      city: "London",
      salary: 92000,
      status: "Active",
    },
    {
      key: 3,
      name: "Liam Chen",
      age: 35,
      city: "Singapore",
      salary: 68000,
      status: "Inactive",
    },
    {
      key: 4,
      name: "Sophia Rodriguez",
      age: 29,
      city: "Madrid",
      salary: 81000,
      status: "Active",
    },
    {
      key: 5,
      name: "Ahmed Khan",
      age: 42,
      city: "Dubai",
      salary: 125000,
      status: "Active",
    },
    {
      key: 6,
      name: "Olivia Kim",
      age: 31,
      city: "Seoul",
      salary: 67000,
      status: "Inactive",
    },
    {
      key: 7,
      name: "John Doe",
      age: 28,
      city: "New York",
      salary: 75000,
      status: "Active",
    },
    {
      key: 8,
      name: "Emma Watson",
      age: 24,
      city: "London",
      salary: 92000,
      status: "Active",
    },
    {
      key: 9,
      name: "Liam Chen",
      age: 35,
      city: "Singapore",
      salary: 68000,
      status: "Inactive",
    },
    {
      key: 10,
      name: "Sophia Rodriguez",
      age: 29,
      city: "Madrid",
      salary: 81000,
      status: "Active",
    },
    {
      key: 11,
      name: "Ahmed Khan",
      age: 42,
      city: "Dubai",
      salary: 125000,
      status: "Active",
    },
    {
      key: 12,
      name: "Olivia Kim",
      age: 31,
      city: "Seoul",
      salary: 67000,
      status: "Inactive",
    },
  ];

  return (
    <>
      <CustomTable
        columns={columns}
        dataSource={sampleData}
        initialPageSize={10}
      />
    </>
  );
}
