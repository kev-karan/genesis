from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import (
    NoSuchElementException, TimeoutException, StaleElementReferenceException
)

_SELENIUM_EXC = (NoSuchElementException, TimeoutException, StaleElementReferenceException)


class EstudoPage:
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 10)

    def is_page_loaded(self):
        try:
            self.wait.until(EC.presence_of_element_located(
                (By.CSS_SELECTOR, '.proto-desktop .protocol-card.em-hub-card')
            ))
            return True
        except _SELENIUM_EXC:
            return False

    def get_caso_cards(self):
        try:
            return self.driver.find_elements(
                By.CSS_SELECTOR, '.proto-desktop .protocol-card.em-hub-card'
            )
        except _SELENIUM_EXC:
            return []

    def get_caso_count(self):
        return len(self.get_caso_cards())

    def select_caso_by_name(self, name):
        cards = self.get_caso_cards()
        for card in cards:
            try:
                titulo = card.find_element(By.CSS_SELECTOR, '.protocol-name').text
            except Exception:
                titulo = card.text
            if name in titulo:
                self.driver.execute_script('arguments[0].click()', card)
                return True
        return False

    def select_first_caso(self):
        cards = self.get_caso_cards()
        if cards:
            self.driver.execute_script('arguments[0].click()', cards[0])
            return True
        return False

    def is_estudo_protocolo_loaded(self):
        try:
            self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, '[class*="protocol"], [class*="fluxo"]')))
            return True
        except _SELENIUM_EXC:
            return False

    def click_iniciar_caso(self):
        try:
            btn = self.driver.find_element(By.XPATH, "//button[contains(., 'Iniciar Caso')]")
            btn.click()
            return True
        except _SELENIUM_EXC:
            return False

    def click_iniciar_questoes(self):
        try:
            btn = self.driver.find_element(By.XPATH, "//button[contains(., 'Iniciar questões')]")
            btn.click()
            return True
        except _SELENIUM_EXC:
            return False

    def get_current_question_text(self):
        # Desktop QuestoesMain: <p> filho direto de .pd-card (sem classe CSS)
        for selector in ['.pd-main .pd-card > p', '.med-question']:
            try:
                el = self.driver.find_element(By.CSS_SELECTOR, selector)
                if el.text:
                    return el.text
            except _SELENIUM_EXC:
                pass
        return None

    def click_first_multipla_escolha_opcao(self):
        # Desktop: botões de opção são netos de .pd-card via div intermediário
        for selector in ['.pd-main .pd-card > div > button', '.med-options .med-btn--outline']:
            try:
                btn = self.driver.find_element(By.CSS_SELECTOR, selector)
                btn.click()
                return True
            except _SELENIUM_EXC:
                pass
        return False

    def click_binary_answer(self, answer):
        try:
            btn = self.driver.find_element(By.XPATH, f"//button[text()='{answer}']")
            btn.click()
            return True
        except _SELENIUM_EXC:
            return False

    def enter_numeric_answer(self, value):
        try:
            input_el = self.driver.find_element(By.CSS_SELECTOR, 'input[inputMode="decimal"]')
            input_el.clear()
            input_el.send_keys(str(value))
            return True
        except _SELENIUM_EXC:
            return False

    def click_confirmar(self):
        try:
            btn = self.driver.find_element(By.XPATH, "//button[text()='Confirmar']")
            btn.click()
            return True
        except _SELENIUM_EXC:
            return False

    def click_confirmar_if_available(self):
        """Clica em Confirmar se presente e habilitado (multipla_escolha); no-op rápido para binária."""
        try:
            self.driver.implicitly_wait(2)
            btn = self.driver.find_element(
                By.XPATH, "//button[text()='Confirmar' and not(@disabled)]"
            )
            btn.click()
            return True
        except _SELENIUM_EXC:
            return False
        finally:
            self.driver.implicitly_wait(10)

    def has_feedback_correto(self):
        try:
            self.wait.until(EC.presence_of_element_located((
                By.XPATH,
                "//*[contains(@class,'med-feedback--success') or contains(text(),'Correto!')]"
            )))
            return True
        except _SELENIUM_EXC:
            return False

    def has_feedback_incorreto(self):
        try:
            self.wait.until(EC.presence_of_element_located((
                By.XPATH,
                "//*[contains(@class,'med-feedback--error') or contains(text(),'Incorreto')]"
            )))
            return True
        except _SELENIUM_EXC:
            return False

    def click_proxima_pergunta(self):
        try:
            btn = self.driver.find_element(By.XPATH, "//button[contains(., 'Próxima')]")
            btn.click()
            return True
        except _SELENIUM_EXC:
            return False

    def is_concluido(self):
        try:
            self.wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Caso concluído')]")))
            return True
        except _SELENIUM_EXC:
            return False

    def go_back(self):
        try:
            btn = self.driver.find_element(By.CSS_SELECTOR, '.med-back-btn, .back-btn, .pd-back-btn')
            btn.click()
            return True
        except _SELENIUM_EXC:
            return False

    def click_multipla_opcao_by_text(self, text):
        # Desktop: botão com texto correspondente dentro de .pd-main
        try:
            btn = self.driver.find_element(
                By.XPATH, f"//div[contains(@class,'pd-main')]//button[contains(.,'{text}')]"
            )
            btn.click()
            return True
        except _SELENIUM_EXC:
            pass
        # Fallback mobile
        try:
            btns = self.driver.find_elements(By.CSS_SELECTOR, '.med-options .med-btn--outline')
            for b in btns:
                if text in b.text:
                    b.click()
                    return True
        except _SELENIUM_EXC:
            pass
        return False

    def click_avancar(self):
        """Clica em 'Próxima pergunta' ou 'Concluir' após responder uma questão."""
        try:
            btn = self.driver.find_element(
                By.XPATH,
                "//button[contains(., 'Próxima') or contains(., 'Concluir')]"
            )
            btn.click()
            return True
        except _SELENIUM_EXC:
            return False

    def has_conclusao_button(self):
        try:
            self.driver.find_element(
                By.XPATH, "//button[contains(., 'Voltar ao Modo Estudo')]"
            )
            return True
        except _SELENIUM_EXC:
            return False
