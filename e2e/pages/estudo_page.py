from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


class EstudoPage:
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 10)

    def is_page_loaded(self):
        try:
            self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, '.protocol-list, .page-title')))
            return True
        except:
            return False

    def get_caso_cards(self):
        try:
            return self.driver.find_elements(By.CSS_SELECTOR, '.protocol-list .protocol-card')
        except:
            return []

    def get_caso_count(self):
        return len(self.get_caso_cards())

    def select_caso_by_name(self, name):
        cards = self.get_caso_cards()
        for card in cards:
            if name in card.text:
                card.click()
                return True
        return False

    def select_first_caso(self):
        cards = self.get_caso_cards()
        if cards:
            cards[0].click()
            return True
        return False

    def is_estudo_protocolo_loaded(self):
        try:
            self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, '[class*="protocol"], [class*="fluxo"]')))
            return True
        except:
            return False

    def click_iniciar_caso(self):
        try:
            btn = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Iniciar Caso')]")
            btn.click()
            return True
        except:
            return False

    def click_iniciar_questoes(self):
        try:
            btn = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Iniciar questões')]")
            btn.click()
            return True
        except:
            return False

    def get_current_question_text(self):
        try:
            question = self.driver.find_element(By.CSS_SELECTOR, '.med-question')
            return question.text
        except:
            return None

    def click_binary_answer(self, answer):
        try:
            btn = self.driver.find_element(By.XPATH, f"//button[text()='{answer}']")
            btn.click()
            return True
        except:
            return False

    def enter_numeric_answer(self, value):
        try:
            input_el = self.driver.find_element(By.CSS_SELECTOR, 'input[inputMode="decimal"]')
            input_el.clear()
            input_el.send_keys(str(value))
            return True
        except:
            return False

    def click_confirmar(self):
        try:
            btn = self.driver.find_element(By.XPATH, "//button[text()='Confirmar']")
            btn.click()
            return True
        except:
            return False

    def has_feedback_correto(self):
        try:
            self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, '.med-feedback--success')))
            return True
        except:
            return False

    def has_feedback_incorreto(self):
        try:
            self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, '.med-feedback--error')))
            return True
        except:
            return False

    def click_proxima_pergunta(self):
        try:
            btn = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Próxima')]")
            btn.click()
            return True
        except:
            return False

    def is_concluido(self):
        try:
            self.wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Caso concluído')]")))
            return True
        except:
            return False

    def go_back(self):
        try:
            btn = self.driver.find_element(By.CSS_SELECTOR, '.back-btn')
            btn.click()
            return True
        except:
            return False
