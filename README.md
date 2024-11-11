# Finance Management API

<!--toc:start-->

- [Finance Management API](#finance-management-api) - [To setup locally](#to-setup-locally) - [Check API documentation](#check-api-documentation)
<!--toc:end-->

### To setup locally

- This project uses bun as its package manager, you need to have bun installed in your system.
- To install bun follow the official guide at https://bun.sh

```bash
git clone https://github.com/GenieWizards/finance-management-api.git # clones the repo in cwd
cd finance-management-api # navigate to the cloned folder
bun install # install necessary dependencies using bun package manager
bun dev # start the server in development mode
```

### Check API documentation

- The API documentation is available at {{API_URL}}/reference

### If the schema is added/updated then you need to generate/apply the migrations
```bash
bun db:generate # generates the migration
bun db:migrate # applies the migration
```
