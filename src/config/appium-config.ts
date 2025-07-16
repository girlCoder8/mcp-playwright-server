export const appiumConfig = {
  serverUrl: process.env.APPIUM_SERVER_URL,
  capabilities: {
    platformName: "iOS",
    deviceName: "iPhone 14",
    platformVersion: "16.0",
    automationName: "XCUITest",
    browserName: "Safari"
  }
};
