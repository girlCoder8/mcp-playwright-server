# mcp-playwright-server

Automation framework using Playwright and Model Context Protocol for test execution and scenario management.

## Project Structure

```
mcp-playwright-server/
├── README.md
├── .gitignore
├── .env
├── package.json
├── .github/
│   └── workflows/
│       └── ci.yml
├── examples/
├── logs/
├── postman/
│   ├── sample.postman.json
│   └── sample-env.postman.json
├── screenshots/
├── scripts/
│   ├── run-postman.js
│   └── headspin-test.sh
├── src/
│   ├── config/
│   │   ├── appium-config.ts
│   │   └── headspin-config.ts
│   ├── integrations/
│   │   ├── postman.ts
│   │   └── zephyr.ts
│   ├── middleware/
│   ├── playwright/
│   ├── server/
│   └── utils/

```

## What the Automation Framework Entails

- **Playwright Integration:** Enables browser automation for end-to-end testing.
- **Model Context Protocol (MCP):** Manages test scenarios and execution context.
- **Postman Integration:** Supports API testing using Postman collections.
- **Zephyr Integration:** Connects with Zephyr for test management.
- **Appium & Headspin Support:** Allows mobile automation and remote device testing.
- **Logging & Reporting:** Captures logs and screenshots for test runs.

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-org/mcp-playwright-server.git
   cd mcp-playwright-server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   - Copy sample environment files from `postman/` if needed.
   - Configure any required credentials in `src/config/`.

## Usage

- **Run Playwright tests:**
  ```bash
  npm run test
  ```

- **Execute Postman collections:**
  ```bash
  node scripts/run-postman.js
  ```

- **Run Headspin tests:**
  ```bash
  bash scripts/headspin-test.sh
  ```

## Contributing

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/your-feature`).
3. Commit your changes.
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a pull request.

## License

This project is licensed under the MIT License.

---

For more details, see the documentation in each folder or contact the