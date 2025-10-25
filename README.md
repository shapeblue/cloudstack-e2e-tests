# CloudStack UI Automation Framework

Apache CloudStack UI automation framework using Playwright for end-to-end testing of the web interface. Includes smoke tests, BAT tests, and automated regression testing integrated with Jenkins CI/CD.

[![Playwright](https://img.shields.io/badge/Playwright-45ba4b?style=flat&logo=playwright&logoColor=white)](https://playwright.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Apache CloudStack](https://img.shields.io/badge/Apache%20CloudStack-blue?style=flat)](https://cloudstack.apache.org/)

---

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Jenkins Integration](#jenkins-integration)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)

---

## Overview

This framework provides automated UI testing for Apache CloudStack using Playwright. It's designed to:

- Verify CloudStack UI functionality
- Run smoke tests for quick health checks
- Execute BAT (Basic Acceptance Tests) for core features
- Integrate seamlessly with Jenkins CI/CD
- Generate comprehensive test reports
- Support multiple CloudStack environments

### Test Categories

| Category | Duration | Purpose | When to Run |
|----------|----------|---------|-------------|
| **@smoke** | 1-2 min | Quick health check (login, navigation) | After every deployment |
| **@bat** | 5-10 min | Core functionality (VM deployment, basic operations) | Before release |
| **all** | 10-20 min | Complete test suite | Full regression |

---

## Prerequisites

### Required Software

- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **Git**: For cloning the repository

### CloudStack Requirements

- Apache CloudStack instance (4.18+ recommended)
- Management server accessible via HTTP/HTTPS
- Admin credentials

### System Requirements

- **OS**: Linux, macOS, or Windows
- **RAM**: 2GB minimum, 4GB recommended
- **Disk**: 1GB free space

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/shapeblue/cloudstack-ui-automation.git
cd cloudstack-ui-automation
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Install Playwright Browsers

```bash
npx playwright install chromium --with-deps
```

Or install all browsers:

```bash
npx playwright install --with-deps
```

### 4. Verify Installation

```bash
npx playwright --version
```

---

## Configuration

### Environment Setup

Create a `.env` file in the project root:

```bash
# CloudStack Configuration
CLOUDSTACK_URL=http://10.0.3.101:8080/client
CLOUDSTACK_MGMT_IP=10.0.3.101
CLOUDSTACK_USERNAME=admin
CLOUDSTACK_PASSWORD=password
CLOUDSTACK_DOMAIN=/

# Test Configuration
HEADLESS=true
BROWSER=chromium
TIMEOUT=30000
```

### Configuration Options

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `CLOUDSTACK_URL` | CloudStack UI URL | - | Yes |
| `CLOUDSTACK_MGMT_IP` | Management server IP | - | Yes |
| `CLOUDSTACK_USERNAME` | Admin username | `admin` | Yes |
| `CLOUDSTACK_PASSWORD` | Admin password | `password` | Yes |
| `CLOUDSTACK_DOMAIN` | Domain path | `/` | Optional |
| `HEADLESS` | Run in headless mode | `true` | Optional |
| `BROWSER` | Browser to use | `chromium` | Optional |
| `TIMEOUT` | Default timeout (ms) | `30000` | Optional |

### Manual Configuration

If not using `.env`, you can configure in `playwright.config.js`:

```javascript
export default defineConfig({
  use: {
    baseURL: 'http://your-cloudstack-url:8080/client',
    // ... other settings
  },
});
```

---

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Smoke Tests Only

```bash
npm test -- --grep "@smoke"
```

### Run BAT Tests Only

```bash
npm test -- --grep "@bat"
```

### Run Specific Test File

```bash
npm test tests/01-login.spec.js
```

### Run in Headed Mode (See Browser)

```bash
npm run test:headed
```

### Run with UI Mode (Interactive)

```bash
npm run test:ui
```

### Debug Mode

```bash
npm run test:debug
```

---

## Test Structure

```
cloudstack-ui-automation/
├── tests/                          # Test files
│   ├── 01-login.spec.js           # Login/logout tests (@smoke, @bat)
│   ├── 02-vm-deployment.spec.js   # VM deployment tests (@bat)
│   └── fixtures.js                # Test fixtures and setup
│
├── pages/                          # Page Object Models
│   ├── BasePage.js                # Base page class
│   ├── LoginPage.js               # Login page
│   ├── DashboardPage.js           # Dashboard page
│   └── VirtualMachinePage.js      # VM management page
│
├── utils/                          # Utility scripts
│   ├── environment-extractor.js   # Extract config from Trillian
│   └── helpers.js                 # Helper functions
│
├── playwright.config.js            # Playwright configuration
├── package.json                    # Dependencies and scripts
└── .env                           # Environment variables (create this)
```

### Test Files

#### `tests/01-login.spec.js`
- Login with valid credentials (@smoke, @bat)
- Login with invalid credentials (@smoke)
- Logout functionality (@smoke)
- Dashboard navigation (@smoke)

#### `tests/02-vm-deployment.spec.js`
- Deploy virtual machine (@bat)
- Deploy VM and wait for Running state (@bat)
- Deploy VM with custom configuration (@bat)
- Verify VM in list (@bat)

### Page Objects

Page Object Model (POM) pattern for maintainable tests:

```javascript
// Example: pages/LoginPage.js
class LoginPage extends BasePage {
  async login(username, password) {
    await this.fillInput('#username', username);
    await this.fillInput('#password', password);
    await this.clickElement('#login-button');
  }
}
```

---

## Jenkins Integration

### Prerequisites

- Jenkins instance with Pipeline support
- Jenkins agent with Node.js and Git installed
- Access to CloudStack environment

### Setup

1. **Create Jenkins Job** (or use existing Trillian job)
2. **Add Parameters**:
   - `RUN_UI_TESTS` (Boolean): Enable UI tests
   - `UI_TEST_SUITE` (Choice): `@smoke`, `@bat`, or `all`

3. **Add Build Steps**:

#### Clone Repository (Execute Shell)

```bash
#!/bin/bash
echo "Cloning UI Automation Framework"
UI_AUTO_DIR="$WORKSPACE/cloudstack-ui-automation"

if [ -d "$UI_AUTO_DIR" ]; then
    rm -rf "$UI_AUTO_DIR"
fi

git clone https://github.com/shapeblue/cloudstack-ui-automation.git "$UI_AUTO_DIR"
```

#### Run Tests (Execute Shell)

```bash
#!/bin/bash
if [ "$RUN_UI_TESTS" != "true" ]; then
    echo "UI tests disabled"
    exit 0
fi

cd "$WORKSPACE/cloudstack-ui-automation"
npm install
npx playwright install chromium --with-deps

# Extract environment from Trillian
node utils/environment-extractor.js "$WORKSPACE"

# Run tests
export TESTS_TO_RUN="${UI_TEST_SUITE:-@bat}"
export HEADLESS="true"
npm test -- --grep "$TESTS_TO_RUN"
```

4. **Add Post-Build Actions**:
   - Publish JUnit results: `ui-test-results/junit.xml`
   - Publish HTML reports: `ui-test-results/html-report/index.html`
   - Archive artifacts: `ui-test-results/**/*`

### Jenkins Pipeline Example

```groovy
pipeline {
    agent any
    
    parameters {
        booleanParam(name: 'RUN_UI_TESTS', defaultValue: false, description: 'Run UI tests')
        choice(name: 'UI_TEST_SUITE', choices: ['@bat', '@smoke', 'all'], description: 'Test suite')
    }
    
    stages {
        stage('Deploy CloudStack') {
            steps {
                // Your Trillian deployment steps
            }
        }
        
        stage('Clone UI Tests') {
            steps {
                sh '''
                    git clone https://github.com/shapeblue/cloudstack-ui-automation.git
                '''
            }
        }
        
        stage('Run UI Tests') {
            when {
                expression { params.RUN_UI_TESTS == true }
            }
            steps {
                dir('cloudstack-ui-automation') {
                    sh '''
                        npm install
                        npx playwright install chromium --with-deps
                        node utils/environment-extractor.js "$WORKSPACE"
                        npm test -- --grep "${UI_TEST_SUITE}"
                    '''
                }
            }
        }
    }
    
    post {
        always {
            junit 'cloudstack-ui-automation/test-results/junit.xml'
            publishHTML([
                reportDir: 'cloudstack-ui-automation/playwright-report',
                reportFiles: 'index.html',
                reportName: 'Playwright Test Report'
            ])
        }
    }
}
```

---

## Test Reports

### HTML Report

After tests run, view the interactive HTML report:

```bash
npx playwright show-report
```

Or open manually:
```
playwright-report/index.html
```

### JUnit XML Report

Located at: `test-results/junit.xml`

Used by Jenkins for test result visualization.

### Console Output

Real-time test execution output in terminal.

---

## Troubleshooting

### Common Issues

#### 1. Browser Not Found

**Error**: `browserType.launch: Executable doesn't exist`

**Solution**:
```bash
npx playwright install chromium --with-deps
```

#### 2. Connection Refused

**Error**: `net::ERR_CONNECTION_REFUSED`

**Solution**: Verify CloudStack URL in `.env`:
```bash
# Check if CloudStack is accessible
curl http://your-cloudstack-url:8080/client
```

#### 3. Login Failed

**Error**: `Login failed - Element not found`

**Solution**: 
- Verify credentials in `.env`
- Check CloudStack version compatibility
- Run in headed mode to see what's happening:
```bash
npm run test:headed
```

#### 4. Tests Timeout

**Error**: `Test timeout of 30000ms exceeded`

**Solution**: Increase timeout in `.env`:
```bash
TIMEOUT=60000
```

Or in specific test:
```javascript
test.setTimeout(60000);
```

#### 5. Environment Extraction Failed

**Error**: `Failed to extract environment configuration`

**Solution**: Ensure Trillian created these files:
```bash
ls $WORKSPACE/config_name
ls $WORKSPACE/Ansible/hosts_*
```

---

## Contributing

### Adding New Tests

1. **Create test file** in `tests/` directory
2. **Use appropriate tags**: `@smoke`, `@bat`, `@network`, etc.
3. **Follow naming convention**: `NN-feature-name.spec.js`
4. **Use Page Objects** for UI interactions

Example:
```javascript
// tests/03-networks.spec.js
import { test, expect } from './fixtures';

test('should create network @bat @network', async ({ networkPage }) => {
  await networkPage.createNetwork({
    name: 'test-network',
    displayText: 'Test Network'
  });
  
  expect(await networkPage.networkExists('test-network')).toBeTruthy();
});
```

### Creating Page Objects

1. **Extend BasePage** for common functionality
2. **Use descriptive method names**
3. **Add JSDoc comments**

Example:
```javascript
// pages/NetworkPage.js
import BasePage from './BasePage.js';

class NetworkPage extends BasePage {
  /**
   * Creates a new guest network
   * @param {Object} config - Network configuration
   * @param {string} config.name - Network name
   * @param {string} config.displayText - Display text
   */
  async createNetwork(config) {
    await this.clickElement('button:has-text("Add Guest Network")');
    await this.fillInput('[name="name"]', config.name);
    await this.clickElement('button:has-text("Create")');
  }
}

export default NetworkPage;
```

### Code Style

- Use `async/await` for asynchronous operations
- Use descriptive variable names
- Add comments for complex logic
- Follow existing patterns in the codebase

---

## Test Coverage

### Current Coverage

- Login/Logout
- Dashboard navigation
- VM deployment
- VM state verification

### Planned Coverage

- Network management
- Storage operations
- Template management
- User/Account management
- Project management

---

## Best Practices

### Test Design

1. **Keep tests independent**: Each test should run standalone
2. **Use descriptive names**: Test name should describe what it does
3. **Tag appropriately**: Use `@smoke`, `@bat`, `@network`, etc.
4. **Clean up resources**: Delete created resources after tests

### Page Objects

1. **One page object per page**: Don't mix different pages
2. **Reusable methods**: Create methods that can be used by multiple tests
3. **Wait for elements**: Use proper wait strategies
4. **Error handling**: Add meaningful error messages

### Configuration

1. **Use environment variables**: Don't hardcode URLs/credentials
2. **Keep secrets safe**: Never commit `.env` to Git
3. **Document requirements**: Add comments for config options

---

## Learning Resources

### Playwright Documentation

- [Official Playwright Docs](https://playwright.dev/)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [Best Practices](https://playwright.dev/docs/best-practices)

### CloudStack Documentation

- [CloudStack Documentation](https://docs.cloudstack.apache.org/)
- [CloudStack UI Guide](https://docs.cloudstack.apache.org/en/latest/adminguide/ui.html)

---

## License

Apache License 2.0

---

## Maintainers

- ShapeBlue QA Team

---

## Support

For questions or issues:

1. Check [Troubleshooting](#troubleshooting) section
2. Review [GitHub Issues](https://github.com/shapeblue/cloudstack-ui-automation/issues)
3. Contact ShapeBlue QA team

---

## Quick Start (TL;DR)

```bash
# Clone and install
git clone https://github.com/shapeblue/cloudstack-ui-automation.git
cd cloudstack-ui-automation
npm install
npx playwright install chromium --with-deps

# Configure
echo "CLOUDSTACK_URL=http://your-cloudstack:8080/client" > .env
echo "CLOUDSTACK_MGMT_IP=your-mgmt-ip" >> .env
echo "CLOUDSTACK_USERNAME=admin" >> .env
echo "CLOUDSTACK_PASSWORD=password" >> .env

# Run tests
npm test -- --grep "@smoke"  # Quick smoke tests
npm test -- --grep "@bat"    # Core BAT tests
npm test                      # All tests
```

---

**Happy Testing!**
