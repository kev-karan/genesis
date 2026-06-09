from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import (
    NoSuchElementException, TimeoutException, StaleElementReferenceException
)

_SELENIUM_EXC = (NoSuchElementException, TimeoutException, StaleElementReferenceException)


class ContaPage:
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 10)

    def is_page_loaded(self):
        try:
            self.wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Minha Conta')]")))
            return True
        except _SELENIUM_EXC:
            return False

    def get_user_email(self):
        try:
            email = self.driver.find_element(By.CSS_SELECTOR, '.content p[style*="font-weight: 700"], .content [style*="overflow-wrap: break-word"]')
            return email.text
        except _SELENIUM_EXC:
            try:
                elements = self.driver.find_elements(By.XPATH, "//*[contains(text(), '@')]")
                for el in elements:
                    text = el.text.strip()
                    if '@' in text and len(text) > 5:
                        return text
            except _SELENIUM_EXC:
                pass
            return None

    def click_logout(self):
        try:
            btn = self.driver.find_element(By.XPATH, "//button[contains(., 'Sair')]")
            btn.click()
            return True
        except _SELENIUM_EXC:
            return False

    def is_bottom_nav_conta_active(self):
        try:
            conta_btn = self.driver.find_element(By.CSS_SELECTOR, '.nav-btn[aria-label="Minha Conta"]')
            svg = conta_btn.find_element(By.TAG_NAME, 'svg')
            stroke = svg.get_attribute('stroke') or ''
            return '#2A569F' in stroke or 'rgb(42, 86, 159)' in stroke
        except _SELENIUM_EXC:
            return False

    def click_home_nav(self):
        try:
            btn = self.driver.find_element(By.CSS_SELECTOR, '.nav-btn[aria-label="Home"]')
            btn.click()
            return True
        except _SELENIUM_EXC:
            return False

    def click_bottom_nav_conta(self):
        try:
            btn = self.driver.find_element(By.CSS_SELECTOR, '.nav-btn[aria-label="Minha Conta"]')
            btn.click()
            return True
        except _SELENIUM_EXC:
            return False
