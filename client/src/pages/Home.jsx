import React from "react";

const Home = () => {
  return (
    <div
      style={{
        padding: "3rem 2rem",
        maxWidth: "720px",
        margin: "auto",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: "#333",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          fontSize: "2.8rem",
          color: "#3f51b5",
          marginBottom: "0.3rem",
          fontWeight: "700",
          letterSpacing: "1px",
        }}
      >
        Welcome to Task Manager
      </h1>
      <p
        style={{
          fontSize: "1.1rem",
          color: "#555",
          marginBottom: "2rem",
          lineHeight: "1.5",
          fontWeight: "500",
        }}
      >
        A powerful MERN stack app with Admin & User dashboards for efficient
        task management.
      </p>

      <section
        style={{
          backgroundColor: "#fff",
          padding: "1.5rem 2rem",
          borderRadius: "10px",
          boxShadow: "0 3px 8px rgba(0,0,0,0.07)",
          marginBottom: "2rem",
          textAlign: "left",
        }}
      >
        <h2
          style={{
            fontSize: "1.6rem",
            color: "#3949ab",
            marginBottom: "1rem",
            borderBottom: "2px solid #3f51b5",
            paddingBottom: "0.5rem",
            fontWeight: "600",
          }}
        >
          Key Features
        </h2>
        <ul
          style={{
            listStyle: "inside disc",
            fontSize: "1rem",
            color: "#666",
            lineHeight: "1.6",
          }}
        >
          <li>Secure authentication & role-based access control</li>
          <li>Create, assign, and track tasks with ease</li>
          <li>Real-time task status updates and notifications</li>
          <li>Responsive design for desktop and mobile devices</li>
          <li>Clean and intuitive user interface</li>
        </ul>
      </section>

      <section
        style={{
          backgroundColor: "#fff",
          padding: "1.5rem 2rem",
          borderRadius: "10px",
          boxShadow: "0 3px 8px rgba(0,0,0,0.07)",
          textAlign: "left",
        }}
      >
        <h2
          style={{
            fontSize: "1.6rem",
            color: "#3949ab",
            marginBottom: "1rem",
            borderBottom: "2px solid #3f51b5",
            paddingBottom: "0.5rem",
            fontWeight: "600",
          }}
        >
          Getting Started
        </h2>
        <p style={{ fontSize: "1rem", color: "#555", lineHeight: "1.5" }}>
          Navigate through the dashboard to manage your tasks efficiently. Use
          the admin panel to control user roles and monitor task progress.
          Explore the user panel to update your tasks and view assignments.
        </p>
      </section>

      <p
        style={{
          marginTop: "2rem",
          fontStyle: "italic",
          color: "#999",
          fontSize: "0.9rem",
        }}
      >
        Note: This is a demo application designed for learning and testing
        purposes only.
      </p>
    </div>
  );
};

export default Home;
