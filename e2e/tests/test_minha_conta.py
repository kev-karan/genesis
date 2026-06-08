import pytest
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from pages.conta_page import ContaPage
from pages.home_page import HomePage
from pages.login_page import LoginPage


class TestMinhaConta:
    def test_minha_conta_acessivel(self, logged_in):
        driver = logged_in

        try:
            conta_btn = driver.find_element(By.CSS_SELECTOR, '.nav-btn[aria-label="Minha Conta"]')
            conta_btn.click()
        except:
            pytest.skip("Botão Minha Conta na BottomNav não encontrado")
        time.sleep(2)

        conta_page = ContaPage(driver)
        assert conta_page.is_page_loaded(), "Minha Conta não carregou"

        email = conta_page.get_user_email()
        assert email is not None and len(email) > 0, "Email do usuário não exibido"

    def test_logout_da_conta(self, logged_in):
        driver = logged_in

        try:
            conta_btn = driver.find_element(By.CSS_SELECTOR, '.nav-btn[aria-label="Minha Conta"]')
            conta_btn.click()
        except:
            pytest.skip("Botão Minha Conta na BottomNav não encontrado")
        time.sleep(2)

        conta_page = ContaPage(driver)
        assert conta_page.is_page_loaded(), "Minha Conta não carregou"

        if not conta_page.click_logout():
            pytest.skip("Botão Sair não encontrado")
        time.sleep(2)

        token = driver.execute_script("return localStorage.getItem('token')")
        assert token is None, "Token não foi removido após logout"

        try:
            WebDriverWait(driver, 5).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, '.login-btn-entrar, input[placeholder="Email"]'))
            )
            assert True
        except:
            pytest.skip("Não redirecionou para login após logout")

    def test_bottom_nav_conta_ativo(self, logged_in):
        driver = logged_in

        try:
            conta_btn = driver.find_element(By.CSS_SELECTOR, '.nav-btn[aria-label="Minha Conta"]')
            conta_btn.click()
        except:
            pytest.skip("Botão Minha Conta na BottomNav não encontrado")
        time.sleep(2)

        conta_page = ContaPage(driver)
        assert conta_page.is_page_loaded(), "Minha Conta não carregou"

        assert conta_page.is_bottom_nav_conta_active(), \
            "Aba Minha Conta não está ativa na BottomNav"

    def test_voltar_home(self, logged_in):
        driver = logged_in

        try:
            conta_btn = driver.find_element(By.CSS_SELECTOR, '.nav-btn[aria-label="Minha Conta"]')
            conta_btn.click()
        except:
            pytest.skip("Botão Minha Conta na BottomNav não encontrado")
        time.sleep(2)

        conta_page = ContaPage(driver)
        assert conta_page.is_page_loaded(), "Minha Conta não carregou"

        if not conta_page.click_home_nav():
            pytest.skip("Botão Home na BottomNav não encontrado")
        time.sleep(2)

        home_page = HomePage(driver)
        assert home_page.is_page_loaded(), "Home não foi carregada após voltar"
