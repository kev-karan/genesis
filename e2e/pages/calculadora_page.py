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

    # --- Desktop (CalculadoraShell / proto-desktop) helpers ---

    def wait_for_desktop_hub(self):
        try:
            self.wait.until(EC.presence_of_element_located(
                (By.CSS_SELECTOR, '.proto-desktop .protocol-card')
            ))
            return True
        except _SELENIUM_EXC:
            return False

    def get_desktop_medication_names(self):
        try:
            cards = self.driver.find_elements(By.CSS_SELECTOR, '.proto-desktop .protocol-card')
            return [c.find_element(By.CSS_SELECTOR, '.protocol-name').text for c in cards]
        except _SELENIUM_EXC:
            return []

    def click_star_on_desktop_medication(self, index=0):
        try:
            cards = self.driver.find_elements(By.CSS_SELECTOR, '.proto-desktop .protocol-card')
            if index >= len(cards):
                return False
            star_div = cards[index].find_elements(By.TAG_NAME, 'div')[-1]
            self.driver.execute_script('arguments[0].click()', star_div)
            return True
        except _SELENIUM_EXC:
            return False

    def click_tab(self, label):
        try:
            tabs = self.driver.find_elements(By.CSS_SELECTOR, '.proto-desktop button')
            for t in tabs:
                if t.text.strip() == label:
                    t.click()
                    return True
        except _SELENIUM_EXC:
            pass
        return False

    def get_desktop_conversion_names(self):
        try:
            self.wait.until(EC.presence_of_element_located(
                (By.CSS_SELECTOR, '.proto-desktop .protocol-card')
            ))
            cards = self.driver.find_elements(By.CSS_SELECTOR, '.proto-desktop .protocol-card')
            return [c.find_element(By.CSS_SELECTOR, '.protocol-name').text for c in cards]
        except _SELENIUM_EXC:
            return []

    def click_star_on_desktop_conversion(self, index=0):
        return self.click_star_on_desktop_medication(index)

    def expand_sidebar_card(self, title):
        try:
            headers = self.driver.find_elements(By.CSS_SELECTOR, '.pd-sb-header')
            for h in headers:
                if title in h.text:
                    if h.get_attribute('aria-expanded') != 'true':
                        h.click()
                    return True
        except _SELENIUM_EXC:
            pass
        return False

    def get_sidebar_recents_count(self):
        try:
            headers = self.driver.find_elements(By.CSS_SELECTOR, '.pd-sb-header')
            for h in headers:
                if 'Últimos Cálculos' in h.text:
                    parent = h.find_element(By.XPATH, '..')
                    items = parent.find_elements(By.CSS_SELECTOR, '.pd-sb-item-btn')
                    return len([i for i in items if i.is_displayed()])
        except _SELENIUM_EXC:
            pass
        return -1

    def get_sidebar_favorites_labels(self):
        try:
            headers = self.driver.find_elements(By.CSS_SELECTOR, '.pd-sb-header')
            for h in headers:
                if 'Favoritos' in h.text:
                    parent = h.find_element(By.XPATH, '..')
                    labels = parent.find_elements(By.CSS_SELECTOR, '.pd-sb-item-label')
                    return [l.text for l in labels if l.is_displayed()]
        except _SELENIUM_EXC:
            pass
        return []

    def select_desktop_medication_by_name(self, name):
        try:
            cards = self.driver.find_elements(By.CSS_SELECTOR, '.proto-desktop .protocol-card')
            for card in cards:
                if name in card.text:
                    card.click()
                    return True
        except _SELENIUM_EXC:
            pass
        return False

    def wait_for_desktop_form(self):
        try:
            self.wait.until(lambda d: any(
                'mg/kg' in b.text
                for b in d.find_elements(By.CSS_SELECTOR, '.proto-desktop button')
                if b.is_displayed()
            ))
            return True
        except _SELENIUM_EXC:
            return False

    def click_desktop_dose_ref(self, index=0):
        try:
            form_card = self.driver.find_element(By.CSS_SELECTOR, '.proto-desktop .pd-card')
            btns = [b for b in form_card.find_elements(By.TAG_NAME, 'button')
                    if b.is_displayed() and 'mg/kg' in b.text]
            if btns and index < len(btns):
                btns[index].click()
                return True
        except _SELENIUM_EXC:
            pass
        return False

    def click_desktop_apresentacao_by_text(self, text):
        try:
            form_card = self.driver.find_element(By.CSS_SELECTOR, '.proto-desktop .pd-card')
            btns = form_card.find_elements(By.TAG_NAME, 'button')
            for b in btns:
                if text.lower() in b.text.lower() and b.is_displayed():
                    b.click()
                    return True
        except _SELENIUM_EXC:
            pass
        return False

    def enter_desktop_peso(self, weight):
        try:
            inputs = self.driver.find_elements(By.CSS_SELECTOR, '.proto-desktop input')
            for inp in inputs:
                if inp.is_displayed():
                    inp.clear()
                    inp.send_keys(str(weight))
                    return True
        except _SELENIUM_EXC:
            pass
        return False

    def click_desktop_calcular(self):
        try:
            form_card = self.driver.find_element(By.CSS_SELECTOR, '.proto-desktop .pd-card')
            btns = form_card.find_elements(By.TAG_NAME, 'button')
            for b in reversed(btns):
                if b.is_displayed() and b.is_enabled() and 'Calcular' in b.text:
                    b.click()
                    return True
        except _SELENIUM_EXC:
            pass
        return False

    def get_desktop_result_text(self):
        try:
            self.wait.until(EC.presence_of_element_located(
                (By.CSS_SELECTOR, '.proto-desktop .cm-result-section, .proto-desktop [class*="result"]')
            ))
            result = self.driver.find_element(
                By.CSS_SELECTOR,
                '.proto-desktop .cm-result-section, .proto-desktop [class*="result"]'
            )
            return result.text
        except _SELENIUM_EXC:
            return ''

    def has_desktop_result_with_text(self, text):
        try:
            self.wait.until(lambda d: text in d.find_element(
                By.CSS_SELECTOR, '.proto-desktop'
            ).text)
            return True
        except _SELENIUM_EXC:
            return False

    def click_desktop_apresentacao(self, index=0):
        try:
            form_card = self.driver.find_element(By.CSS_SELECTOR, '.proto-desktop .pd-card')
            btns = [
                b for b in form_card.find_elements(By.TAG_NAME, 'button')
                if b.is_displayed()
                and 'mg/kg' not in b.text
                and 'medicamentos' not in b.text.lower()
                and 'Calcular' not in b.text
                and b.text.strip()
            ]
            if btns and index < len(btns):
                btns[index].click()
                return True
        except _SELENIUM_EXC:
            pass
        return False

    def is_desktop_calcular_enabled(self):
        try:
            form_card = self.driver.find_element(By.CSS_SELECTOR, '.proto-desktop .pd-card')
            for b in reversed(form_card.find_elements(By.TAG_NAME, 'button')):
                if b.is_displayed() and 'Calcular' in b.text:
                    return b.is_enabled()
        except _SELENIUM_EXC:
            pass
        return False

    def has_desktop_dose_limitada_warning(self):
        try:
            self.wait.until(lambda d: 'excede a dose máxima' in
                            d.find_element(By.CSS_SELECTOR, '.proto-desktop').text)
            return True
        except _SELENIUM_EXC:
            return False
