from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import (
    NoSuchElementException, TimeoutException, StaleElementReferenceException
)

_SELENIUM_EXC = (NoSuchElementException, TimeoutException, StaleElementReferenceException)


class CalculadoraPage:
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 10)

    def is_page_loaded(self):
        try:
            self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, '.content')))
            return True
        except _SELENIUM_EXC:
            return False

    def get_medication_list(self):
        try:
            return self.driver.find_elements(By.CSS_SELECTOR, '.protocol-card')
        except _SELENIUM_EXC:
            return []

    def get_medication_count(self):
        return len(self.get_medication_list())

    def select_medication(self, name):
        cards = self.get_medication_list()
        for card in cards:
            if name in card.text:
                card.click()
                return True
        return False

    def select_first_medication(self):
        cards = self.get_medication_list()
        if cards:
            cards[0].click()
            return True
        return False

    def is_detail_loaded(self):
        try:
            self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, '.cm-form-card')))
            return True
        except _SELENIUM_EXC:
            return False

    def get_dose_reference_options(self):
        try:
            return self.driver.find_elements(By.CSS_SELECTOR, '.cm-form-card .SelectCard, .cm-form-card button')
        except _SELENIUM_EXC:
            return []

    def select_dose_reference(self, index=0):
        try:
            cards = self.driver.find_elements(By.CSS_SELECTOR, '.cm-form-card button')
            if cards and index < len(cards):
                cards[index].click()
                return True
        except _SELENIUM_EXC:
            pass
        return False

    def select_apresentacao(self, index=0):
        try:
            sections = self.driver.find_elements(By.CSS_SELECTOR, '.cm-form-card > div')
            for section in sections:
                try:
                    btns = section.find_elements(By.TAG_NAME, 'button')
                    if btns and index < len(btns):
                        btns[index].click()
                        return True
                except _SELENIUM_EXC:
                    pass
        except _SELENIUM_EXC:
            pass
        return False

    def enter_peso(self, weight):
        try:
            input_el = self.driver.find_element(By.CSS_SELECTOR, '.cm-input')
            input_el.clear()
            input_el.send_keys(str(weight))
            return True
        except _SELENIUM_EXC:
            return False

    def is_calculate_button_enabled(self):
        try:
            btn = self.driver.find_element(By.CSS_SELECTOR, '.cm-btn')
            return btn.is_enabled()
        except _SELENIUM_EXC:
            return False

    def click_calcular(self):
        try:
            btn = self.driver.find_element(By.CSS_SELECTOR, '.cm-btn')
            btn.click()
            return True
        except _SELENIUM_EXC:
            return False

    def has_result_section(self):
        try:
            self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, '.cm-result-section')))
            return True
        except _SELENIUM_EXC:
            return False

    def get_result_volume(self):
        try:
            value = self.driver.find_element(By.CSS_SELECTOR, '.cm-result-value strong')
            return value.text
        except _SELENIUM_EXC:
            return None

    def has_dose_limitada_warning(self):
        try:
            warning = self.driver.find_element(By.CSS_SELECTOR, '.cm-result-section [style*="background: #fef3c7"]')
            return warning.is_displayed()
        except _SELENIUM_EXC:
            return False

    def get_error_message(self):
        try:
            error = self.driver.find_element(By.CSS_SELECTOR, '[style*="color: #D94F4F"]')
            return error.text
        except _SELENIUM_EXC:
            return None

    def go_back(self):
        try:
            btn = self.driver.find_element(By.CSS_SELECTOR, '.back-btn')
            btn.click()
            return True
        except _SELENIUM_EXC:
            return False
