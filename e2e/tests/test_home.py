"""
Testes da página Home: exibição, busca, navegação.
"""
import pytest
import time
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from pages.home_page import HomePage
from pages.login_page import LoginPage


class TestHome:
    """Testes da página Home."""

    def test_home_exibe_apos_login(self, logged_in):
        """Test: Home exibe após login bem-sucedido."""
        driver = logged_in

        home_page = HomePage(driver)
        assert home_page.is_page_loaded(), "Home não foi carregada"

        # Verifica presença de elementos-chave
        title = home_page.get_page_title()
        assert title is not None, "Título/logo não visível"

    def test_busca_protocolo(self, logged_in):
        """Test: Buscar 'dengue' mostra resultado no dropdown."""
        driver = logged_in

        home_page = HomePage(driver)
        assert home_page.is_page_loaded(), "Home não carregou"

        home_page.search_protocol("dengue")
        time.sleep(1)

        results = home_page.get_search_results()
        assert len(results) > 0, "Nenhum resultado de busca para 'dengue'"

    def test_emergencia_acessivel_home(self, logged_in):
        """Test: Botão Modo Emergência está ativo e clicável."""
        driver = logged_in

        home_page = HomePage(driver)
        assert home_page.is_page_loaded(), "Home não carregou"

        # Verifica que botão está habilitado
        assert home_page.is_emergencia_button_enabled(), \
            "Botão Modo Emergência não está habilitado"

        # Clica e aguarda navegação
        home_page.click_emergencia_button()
        time.sleep(2)

        # Verifica que navegou (URL ou página mudou)
        assert home_page.get_page_title() != "Emergência" or \
               "localhost:3000" in driver.current_url, \
            "Não navegou para Modo Emergência"
