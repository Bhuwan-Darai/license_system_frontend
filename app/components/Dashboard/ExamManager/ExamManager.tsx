"use client";

import React, { useState } from "react";
import {
  Button,
  Input,
  Popconfirm,
  Result,
  Space,
  Switch,
  Table,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useAuthContext } from "@/app/context/AuthContext";
import { PERM } from "@/config/permissions";
import ExamWizard from "./ExamWizard";
import { ExamSummary, useMutationExam, useQueryExams } from "./useExam";

const PAGE_SIZE = 10;

export default function ExamManager() {
  const { isAllowed } = useAuthContext();
  const canList = isAllowed(PERM.EXAM.LIST);
  const canAdd = isAllowed(PERM.EXAM.ADD);
  const canUpdate = isAllowed(PERM.EXAM.UPDATE);
  const canDelete = isAllowed(PERM.EXAM.DELETE);
  const canVisibility = isAllowed(PERM.EXAM.VISIBILITY);
  // undefined = list, null = creating, string = editing that exam
  const [editing, setEditing] = useState<string | null | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQueryExams(
    page,
    PAGE_SIZE,
    search,
    canList,
  );
  const { setExamVisibility, deleteExam, isTogglingVisibility, isDeleting } =
    useMutationExam();

  if (!canList) {
    return (
      <Result
        status="403"
        title="403"
        subTitle="You don't have permission to view this."
      />
    );
  }

  if (editing !== undefined) {
    return <ExamWizard examId={editing} onClose={() => setEditing(undefined)} />;
  }

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        {canAdd && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setEditing(null)}
          >
            Create Exam
          </Button>
        )}
      </div>

      <Input
        allowClear
        placeholder="Search exams by title..."
        prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
        style={{ maxWidth: 360, marginBottom: 16 }}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />

      <Table<ExamSummary>
        rowKey="exam_id"
        loading={isLoading}
        dataSource={data?.data ?? []}
        pagination={{
          current: page,
          pageSize: PAGE_SIZE,
          total: data?.pagination?.total ?? 0,
          showSizeChanger: false,
          onChange: setPage,
        }}
        locale={{ emptyText: "No exams yet. Click \"Create Exam\" to add one." }}
        columns={[
          { title: "Title", dataIndex: "title" },
          { title: "Questions", dataIndex: "question_count", width: 110 },
          { title: "Total Marks", dataIndex: "total_marks", width: 120 },
          { title: "Pass Marks", dataIndex: "pass_marks", width: 120 },
          {
            title: "Duration",
            dataIndex: "duration",
            width: 110,
            render: (minutes: number) => `${minutes} min`,
          },
          {
            title: "Visibility",
            dataIndex: "is_visible",
            width: 120,
            render: (visible: boolean, exam) => (
              <Switch
                checked={visible}
                checkedChildren="Shown"
                unCheckedChildren="Hidden"
                loading={isTogglingVisibility}
                disabled={!canVisibility}
                onChange={(checked) =>
                  setExamVisibility({ id: exam.exam_id, is_visible: checked })
                }
              />
            ),
          },
          ...(canUpdate || canDelete
            ? [
                {
                  title: "Actions",
                  width: 180,
                  render: (_: unknown, exam: ExamSummary) => (
                    <Space>
                      {canUpdate && (
                        <Button
                          type="text"
                          icon={<EditOutlined />}
                          onClick={() => setEditing(exam.exam_id)}
                        >
                          Edit
                        </Button>
                      )}
                      {canDelete && (
                        <Popconfirm
                          title="Delete Exam"
                          description="Are you sure you want to delete this exam?"
                          okText="Yes"
                          cancelText="No"
                          okButtonProps={{ loading: isDeleting }}
                          onConfirm={() => deleteExam(exam.exam_id)}
                        >
                          <Button type="text" danger icon={<DeleteOutlined />}>
                            Delete
                          </Button>
                        </Popconfirm>
                      )}
                    </Space>
                  ),
                },
              ]
            : []),
        ]}
      />
    </div>
  );
}
