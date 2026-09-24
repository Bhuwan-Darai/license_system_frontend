"use client"
import React, { useState } from "react";
import {
  Button,
  Card,
  Col,
  Row,
  Space,
  Steps,
  Typography,
} from "antd";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const ExamWizard: React.FC = () => {
  const [current, setCurrent] = useState(0);

  const steps = [
    {
      title: "Exam Details",
      description: "Basic information",
    },
    {
      title: "Question Sets",
      description: "Choose question sets",
    },
    {
      title: "Questions",
      description: "Select questions",
    },
    {
      title: "Review",
      description: "Review and create",
    },
  ];

  const next = () => {
    setCurrent((prev) => prev + 1);
  };

  const previous = () => {
    setCurrent((prev) => prev - 1);
  };

  const content = [
    <ExamDetailsStep key="details" />,
    <QuestionSetsStep key="sets" />,
    <QuestionsStep key="questions" />,
    <ReviewStep key="review" />,
  ];

  return (
    <div
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: 24,
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <Title level={2}>Create Exam</Title>

        <Text type="secondary">
          Configure your driving license exam step by step.
        </Text>
      </div>

      {/* Steps */}
      <Card style={{ marginBottom: 24 }}>
        <Steps
          current={current}
          items={steps}
        />
      </Card>

      {/* Step Content */}
      <Card
        style={{
          minHeight: 400,
        }}
      >
        {content[current]}
      </Card>

      {/* Navigation */}
      <Card style={{ marginTop: 24 }}>
        <Row justify="space-between">
          <Col>
            {current > 0 && (
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={previous}
              >
                Previous
              </Button>
            )}
          </Col>

          <Col>
            {current < steps.length - 1 ? (
              <Button
                type="primary"
                icon={<ArrowRightOutlined />}
                iconPosition="end"
                onClick={next}
              >
                Continue
              </Button>
            ) : (
              <Button
                type="primary"
                icon={<CheckOutlined />}
              >
                Create Exam
              </Button>
            )}
          </Col>
        </Row>
      </Card>
    </div>
  );
};

/* =========================================================
   STEP 1
========================================================= */

const ExamDetailsStep: React.FC = () => {
  return (
    <div>
      <Title level={4}>Exam Details</Title>

      <Text type="secondary">
        Enter the basic information for the exam.
      </Text>

      {/* Exam form goes here */}
    </div>
  );
};

/* =========================================================
   STEP 2
========================================================= */

const QuestionSetsStep: React.FC = () => {
  return (
    <div>
      <Title level={4}>Question Sets</Title>

      <Text type="secondary">
        Select the question sets that should be included.
      </Text>

      {/* Question set selection goes here */}
    </div>
  );
};

/* =========================================================
   STEP 3
========================================================= */

const QuestionsStep: React.FC = () => {
  return (
    <div>
      <Title level={4}>Select Questions</Title>

      <Text type="secondary">
        Select individual questions from each question set.
      </Text>

      {/* Question selection goes here */}
    </div>
  );
};

/* =========================================================
   STEP 4
========================================================= */

const ReviewStep: React.FC = () => {
  return (
    <div>
      <Title level={4}>Review Exam</Title>

      <Text type="secondary">
        Review your exam before creating it.
      </Text>

      {/* Review goes here */}
    </div>
  );
};

export default ExamWizard;