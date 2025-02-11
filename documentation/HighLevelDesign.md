# High-Level Design Document

## 1. Introduction

### Purpose
This document serves as a reference for developers working on [Project Name], ensuring that the development team can work independently while maintaining code compatibility.

### Scope
This document focuses on the rationale behind design choices rather than specific implementation details.

### Audience
The document is intended for developers and stakeholders to ensure alignment in development.

---

## 2. System Overview

### Problem Statement
[Describe the problem your project aims to solve.]

### Proposed Solution
[Explain the proposed solution, how it addresses the problem, and any key benefits.]

### Hardware Platform

#### Laptop/Desktop
- **Website:** [How the system will function on desktops/laptops]
- **Touchscreen Laptops:** [Considerations for touchscreen-enabled devices]

---

## 3. Architecture Design

### Architecture Overview
[Describe the chosen architecture type, such as client-server, microservices, or monolithic.]

### Component Diagram
[Provide a diagram outlining major system components and their relationships.]

### Technology Stack
- **Frontend:** [List frontend framework/language]
- **Backend:** [List backend framework/language]
- **Database:** [Database choice and rationale]
- **AI (if applicable):** [Machine learning models and their purpose]

---

## 4. Modules and Components (Internal Interfaces)

### Module Overview
[Describe the key modules/components, their responsibilities, and how they interact.]

### Data Flow Diagram (DFD)
[Illustrate how data moves between different components.]

### Component Interaction
[Explain how system components communicate, including APIs and services.]

---

## 5. Data Design

### Data Model
- **Key Entities:** [List and describe the primary entities]
- **Relationships:** [Describe entity relationships]

### Database Design
- **Database Type:** [Relational (SQL) or NoSQL]
- **Major Tables:** [Overview of the database schema]
- **Indexes & Optimization:** [Performance considerations]

### Data Access Layer
- **ORM or SQL Queries:** [Data access methods]
- **Caching & Performance Optimization:** [Strategies to optimize data access]
- **Encryption & Security:** [How sensitive data is protected]

---

## 6. Integration Points (External Interfaces)

### External Systems & APIs
* **[Groq AI](https://console.groq.com/docs/overview)**
  * Free
  * Easy to set up
  * Works well with Langchain/LangGraph
    * Allows it to have more capabilities than a normal LLM
    * Easy to add new capabilites
  * allows multiple users use it without reducing performance 
  * Faster performance than trying to run an LLM on our own hardware
    * limited to <= 1,000 requests per day or 500,000 tokens per day
    * Users are unlikely to hit the request limit even if they play for about 2-3 hours per day
  * Overview of use:
    * Server invokes python script using command line arguments
    * Script parses arguments & invokes the LLM model using the API 
    * Model calls a function to perform a goal (see [interactions diagram](#12-interactions-diagram) for possible functions)
    * Check for valid output
    * return results to server
* Stripe
  * Free
  * Easy to implement
  * Secure - uses AES-256 encryption, which is considered one of the most secure types
 
### Notifications
* Stripe - handled by API
* Groq
  * Uses API to check if the `429 Too Many Requrests` status code occured
  * Pop up to notify user they hit the rate limit

---

## 7. User Interface (UI) Design Overview

### UI/UX Principles
[Explain core UI/UX principles such as accessibility and responsiveness.]

### Mockups
[Provide high-level mockups or wireframes.]

### Navigation Flow
[Describe how users navigate through the app.]

---

## 8. Game Interface Design Overview

### UI/UX Principles
[Explain core UI/UX principles such as accessibility and responsiveness.]

### Mockups
[Provide high-level mockups or wireframes.]

### Navigation Flow
[Describe how users navigate through the app.]

---

## 9. Security and Privacy

### Identified Risks
[List potential risks, such as security vulnerabilities, technology dependencies, and user privacy concerns.]

### Mitigation Plans
[Describe strategies to mitigate each identified risk.]

### Authentication and Authorization
[Describe role-based access control and permission management.]

### Data Encryption
[Explain data encryption methods for security.]

### Compliance
[Discuss any relevant data protection laws such as GDPR or HIPAA.]

### Privacy
[Describe how user privacy is managed and optional data opt-ins.]

---

## 10. Testing Strategy

### Unit Testing
[Describe how unit tests will be implemented.]

### Manual Testing
[Outline manual testing procedures.]

---

## 11. Business/Legal
[Describe any legal considerations and disclaimers.]
[Describe Business Models]

---

## 12. Interactions Diagram
The diagram below represents how the components will interact with each other. The user will interact with the front end web pages which will send and recieve data from the server using HTTP protocol. The server will be able to interact with [Stripe](#11-businesslegal) to handle payments, a Python script which handles the connection to [Groq](#6-integration-points-external-interfaces), and the [database](#5-data-design). 



![Interaction diagram](interaction-diagram.png)
---

This document serves as a guide for developers and stakeholders to ensure successful project execution.