import os
import time
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException, TimeoutException

from pages.home_page import HomePage
from pages.login_page import LoginPage

BASE_URL = os.getenv("E2E_BASE_URL", "http://localhost:3000")
TEST_EMAIL = os.getenv("E2E_TEST_EMAIL", "teste_e2e@genesis.com")
TEST_PASSWORD = os.getenv("E2E_TEST_PASSWORD", "senha_teste_123")


def _abrir_emergencia(driver):
    home = HomePage(driver)
    home.click_emergencia_button()
    time.sleep(2)


def _get_protocol_names(driver):
    try:
        cards = driver.find_elements(By.CSS_SELECTOR, '.proto-desktop .protocol-card.em-hub-card')
        return [c.find_element(By.CSS_SELECTOR, '.protocol-name').text for c in cards]
    except Exception:
        return []


def _click_star(driver, index=0):
    """Clica no div de favorito do card de índice `index` no desktop shell."""
    cards = driver.find_elements(By.CSS_SELECTOR, '.proto-desktop .protocol-card.em-hub-card')
    if index >= len(cards):
        return False
    star_div = cards[index].find_elements(By.TAG_NAME, 'div')[-1]
    driver.execute_script('arguments[0].click()', star_div)
    return True


def _is_star_filled(driver, index=0):
    """Retorna True se a estrela do card de índice `index` estiver preenchida (fill != 'none')."""
    try:
        cards = driver.find_elements(By.CSS_SELECTOR, '.proto-desktop .protocol-card.em-hub-card')
        if index >= len(cards):
            return False
        svg = cards[index].find_elements(By.TAG_NAME, 'div')[-1].find_element(By.TAG_NAME, 'svg')
        return svg.get_attribute('fill') not in ('none', '', None)
    except Exception:
        return False


def _wait_for_hub(driver, timeout=10):
    try:
        WebDriverWait(driver, timeout).until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, '.proto-desktop .protocol-card.em-hub-card')
            )
        )
        return True
    except (NoSuchElementException, TimeoutException):
        return False


class TestFavoritos:
    def test_favoritar_fluxograma_emergencia(self, logged_in):
        driver = logged_in
        _abrir_emergencia(driver)

        if not _wait_for_hub(driver):
            pytest.skip("Hub de emergência (desktop) não carregou")

        nomes = _get_protocol_names(driver)
        if len(nomes) < 2:
            pytest.skip("Menos de 2 protocolos disponíveis")

        segundo_nome = nomes[1]

        _click_star(driver, index=1)
        time.sleep(2)

        nomes_apos = _get_protocol_names(driver)
        assert nomes_apos[0] == segundo_nome, (
            f"Protocolo favoritado '{segundo_nome}' não subiu para primeiro. "
            f"Lista após: {nomes_apos}"
        )

        # Cleanup: desfavorita o que acabou de subir
        _click_star(driver, index=0)
        time.sleep(1)

    def test_desfavoritar_fluxograma(self, logged_in):
        driver = logged_in
        _abrir_emergencia(driver)

        if not _wait_for_hub(driver):
            pytest.skip("Hub de emergência (desktop) não carregou")

        nomes = _get_protocol_names(driver)
        if len(nomes) < 2:
            pytest.skip("Menos de 2 protocolos disponíveis")

        segundo_nome = nomes[1]

        # Favorita
        _click_star(driver, index=1)
        time.sleep(2)

        nomes_apos_fav = _get_protocol_names(driver)
        assert nomes_apos_fav[0] == segundo_nome, "Favorito não subiu para primeiro"

        # Desfavorita (agora está em index 0)
        _click_star(driver, index=0)
        time.sleep(2)

        assert not _is_star_filled(driver, index=0), (
            "Estrela ainda aparece preenchida após desfavoritar"
        )

        nomes_apos_desfav = _get_protocol_names(driver)
        assert nomes_apos_desfav[0] != segundo_nome, (
            f"'{segundo_nome}' ainda está em primeiro após desfavoritar"
        )

    def test_favorito_persiste_entre_sessoes(self, logged_in):
        driver = logged_in
        _abrir_emergencia(driver)

        if not _wait_for_hub(driver):
            pytest.skip("Hub de emergência (desktop) não carregou")

        nomes = _get_protocol_names(driver)
        if len(nomes) < 2:
            pytest.skip("Menos de 2 protocolos disponíveis")

        segundo_nome = nomes[1]

        _click_star(driver, index=1)
        time.sleep(2)

        # Simula nova sessão: limpa localStorage e faz login de novo
        driver.execute_script("localStorage.clear()")
        driver.get(BASE_URL)
        time.sleep(2)

        login = LoginPage(driver)
        login.enter_email(TEST_EMAIL)
        login.enter_password(TEST_PASSWORD)
        login.submit()
        time.sleep(2)

        _abrir_emergencia(driver)

        if not _wait_for_hub(driver):
            pytest.skip("Hub de emergência não carregou após nova sessão")

        nomes_nova_sessao = _get_protocol_names(driver)
        assert nomes_nova_sessao[0] == segundo_nome, (
            f"Favorito '{segundo_nome}' não persiste após nova sessão. "
            f"Primeiro na lista: '{nomes_nova_sessao[0]}'"
        )

        # Cleanup: desfavorita
        _click_star(driver, index=0)
        time.sleep(1)
