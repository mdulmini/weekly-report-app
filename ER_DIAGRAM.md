erDiagram
    USER ||--o{ REPORT : "submits"
    PROJECT ||--o{ REPORT : "is tagged on"
    USER ||--o{ PROJECT : "creates"
    USER }o--o{ PROJECT : "is a member of"

    USER {
        ObjectId _id PK
        string name
        string email UK
        string password "hashed, select false"
        string role "member | manager"
        ObjectId[] projects FK "optional project assignments"
        date createdAt
        date updatedAt
    }

    PROJECT {
        ObjectId _id PK
        string name UK
        string description
        ObjectId createdBy FK "references USER"
        ObjectId[] members FK "references USER[]"
        boolean isActive
        date createdAt
        date updatedAt
    }

    REPORT {
        ObjectId _id PK
        ObjectId user FK "references USER"
        ObjectId project FK "references PROJECT"
        date weekStartDate
        date weekEndDate
        string tasksCompleted
        string tasksPlanned
        string blockers
        number hoursWorked "optional"
        string notes "optional"
        string status "draft | submitted"
        date submittedAt "optional"
        date createdAt
        date updatedAt
    }