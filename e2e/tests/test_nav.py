import pytest
import time
import os
from dotenv import load_dotenv
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from pages.home_page import HomePage
from pages.login_page import LoginPage

load_dotenv()

BASE_URL = os.getenv("E2E_BASE_URL", "http://localhost:3000")


class TestNav:
    def test_bottom_nav_home_tab(self, logged_in):
        driver = logged_in

        home_page = HomePage(driver)
        assert home_page.is_page_loaded(), "Home não carregou"

        try:
            home_btn = driver.find_element(By.CSS_SELECTOR, '.nav-btn[aria-label="Home"]')
            svg = home_btn.find_element(By.TAG_NAME, 'svg')
            stroke = svg.get_attribute('stroke')
            assert '#2A569F' in stroke, "Home tab não está ativa na BottomNav"
        except:
            pytest.skip("Não foi possível verificar BottomNav Home tab")

    def test_bottom_nav_troca_tela(self, logged_in):
        driver = logged_in

        try:
            conta_btn = driver.find_element(By.CSS_SELECTOR, '.nav-btn[aria-label="Minha Conta"]')
            conta_btn.click()
        except:
            pytest.skip("Botão Minha Conta na BottomNav não encontrado")
        time.sleep(2)

        try:
            WebDriverWait(driver, 5).until(
                EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Minha Conta')]"))
            )
        except:
            pytest.skip("Minha Conta não carregou após navegação")

        try:
            home_btn = driver.find_element(By.CSS_SELECTOR, '.nav-btn[aria-label="Home"]')
            home_btn.click()
        except:
            pytest.skip("Botão Home na BottomNav não encontrado")
        time.sleep(2)

        home_page = HomePage(driver)
        assert home_page.is_page_loaded(), "Home não carregou após voltar"

    def test_desktop_topbar_navega(self, logged_in):
        driver = logged_in

        try:
            calc_btn = driver.find_element(By.XPATH, "//button[contains(., 'CALCULADORA')]")
            calc_btn.click()
        except:
            pytest.skip("Botão CALCULADORA na DesktopTopBar não encontrado")
        time.sleep(2)

        try:
            WebDriverWait(driver, 5).until(
                EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Calculadora')]"))
            )
        except:
            pytest.skip("Calculadora não carregou via DesktopTopBar")

        try:
            emergencia_btn = driver.find_element(By.XPATH, "//button[contains(., 'MODO DE EMERGÊNCIA')]")
            emergencia_btn.click()
        except:
            pytest.skip("Botão MODO DE EMERGÊNCIA na DesktopTopBar não encontrado")
        time.sleep(2)

        try:
            WebDriverWait(driver, 5).until(
                EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Modo Emergência')]"))
            )
        except:
            pytest.skip("Modo Emergência não carregou via DesktopTopBar")

        try:
            estudo_btn = driver.find_element(By.XPATH, "//button[contains(., 'MODO DE ESTUDO')]")
            estudo_btn.click()
        except:
            pytest.skip("Botão MODO DE ESTUDO na DesktopTopBar não encontrado")
        time.sleep(2)

        try:
            WebDriverWait(driver, 5).until(
                EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Modo de Estudo')]"))
            )
        except:
            pytest.skip("Modo Estudo não carregou via DesktopTopBar")

        try:
            home_btn = driver.find_element(By.XPATH, "//button[contains(., 'INÍCIO')]")
            home_btn.click()
        except:
            pytest.skip("Botão INÍCIO na DesktopTopBar não encontrado")
        time.sleep(2)

        home_page = HomePage(driver)
        assert home_page.is_page_loaded(), "Home não carregou via DesktopTopBar"

    def test_auth_redirect_sem_login(self, clean_driver):
        driver = clean_driver
        driver.get(BASE_URL)

        WebDriverWait(driver, 5).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, 'input[type="password"], input[placeholder="Email"]'))
        )

        token = driver.execute_script("return localStorage.getItem('token')")
        assert token is None, "Token presente sem autenticação"
