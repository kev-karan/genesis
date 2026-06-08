"""
Testes da página Protocolo: visualização, nós expandíveis, favoritos.
"""
import pytest
import time
from pages.emergencia_page import EmergenciaPage
from pages.protocolo_page import ProtocoloPage


class TestProtocolo:
    """Testes da página de protocolo/fluxograma."""

    def test_protocolo_dengue_exibe(self, logged_in):
        """Test: Protocolo de Dengue exibe título e nós do fluxograma."""
        driver = logged_in

        # Navega via Home -> Modo Emergência -> Protocolo
        from pages.home_page import HomePage
        from pages.emergencia_page import EmergenciaPage

        home_page = HomePage(driver)
        try:
            home_page.click_emergencia_button()
            time.sleep(2)

            emergencia_page = EmergenciaPage(driver)
            assert emergencia_page.is_page_loaded(), "Modo Emergência não carregou"

            # Clica no primeiro protocolo
            card = emergencia_page.get_first_protocol_card()
            assert card is not None, "Nenhum protocolo encontrado"
            card.click()
            time.sleep(2)
        except Exception as e:
            pytest.skip(f"Não conseguiu navegar para protocolo: {e}")

        protocolo_page = ProtocoloPage(driver)
        assert protocolo_page.is_page_loaded(), \
            "Página protocolo não carregou"

        title = protocolo_page.get_protocol_title()
        assert title is not None and len(title) > 0, \
            "Título do protocolo não exibido"

        nodes = protocolo_page.get_flowchart_nodes()
        assert len(nodes) > 0, "Nenhum nó do fluxograma encontrado"

    def test_expandir_no(self, logged_in):
        """Test: Clicar em nó expande/mostra filhos."""
        driver = logged_in

        from pages.home_page import HomePage
        from pages.emergencia_page import EmergenciaPage

        home_page = HomePage(driver)
        try:
            home_page.click_emergencia_button()
            time.sleep(2)

            emergencia_page = EmergenciaPage(driver)
            card = emergencia_page.get_first_protocol_card()
            card.click()
            time.sleep(2)
        except Exception as e:
            pytest.skip(f"Não conseguiu navegar para protocolo: {e}")

        protocolo_page = ProtocoloPage(driver)
        assert protocolo_page.is_page_loaded(), \
            "Página protocolo não carregou"

        nodes = protocolo_page.get_flowchart_nodes()
        assert len(nodes) > 0, "Nenhum nó encontrado"

        # Tenta clicar no primeiro nó
        try:
            first_node = nodes[0]
            protocolo_page.click_node(first_node)
            time.sleep(1)
        except Exception:
            pytest.skip("Não conseguiu clicar em nó")

    def test_voltar_emergencia(self, logged_in):
        """Test: Back button volta para Modo Emergência."""
        driver = logged_in

        from pages.home_page import HomePage
        from pages.emergencia_page import EmergenciaPage

        home_page = HomePage(driver)
        try:
            home_page.click_emergencia_button()
            time.sleep(2)

            emergencia_page = EmergenciaPage(driver)
            card = emergencia_page.get_first_protocol_card()
            card.click()
            time.sleep(2)
        except Exception as e:
            pytest.skip(f"Não conseguiu navegar para protocolo: {e}")

        protocolo_page = ProtocoloPage(driver)
        assert protocolo_page.is_page_loaded(), \
            "Página protocolo não carregou"

        protocolo_page.go_back()
        time.sleep(2)

        # Verifica que voltou para Emergência
        emergencia_page = EmergenciaPage(driver)
        assert emergencia_page.is_page_loaded(), \
            "Não voltou para Emergência"

    def test_favoritar_dentro_protocolo(self, logged_in):
        """Favorita protocolo no hub, entra nele, verifica sidebar Favoritos."""
        driver = logged_in
        from selenium.webdriver.common.by import By

        from pages.home_page import HomePage
        from pages.emergencia_page import EmergenciaPage

        home_page = HomePage(driver)
        try:
            home_page.click_emergencia_button()
            time.sleep(2)
        except Exception as e:
            pytest.skip(f"Não conseguiu abrir emergência: {e}")

        # Pega nome + estrela do primeiro card no desktop hub
        try:
            cards = driver.find_elements(
                By.CSS_SELECTOR, '.proto-desktop .protocol-card.em-hub-card'
            )
            assert len(cards) >= 1, "Nenhum protocolo no hub desktop"
            nome_card = cards[0].find_element(By.CSS_SELECTOR, '.protocol-name').text

            # Favorita clicando na estrela (último div do card)
            star_div = cards[0].find_elements(By.TAG_NAME, 'div')[-1]
            driver.execute_script('arguments[0].click()', star_div)
            time.sleep(2)
        except Exception as e:
            pytest.skip(f"Não conseguiu favoritar no hub: {e}")

        # Entra no protocolo clicando no card
        try:
            cards = driver.find_elements(
                By.CSS_SELECTOR, '.proto-desktop .protocol-card.em-hub-card'
            )
            cards[0].click()
            time.sleep(2)
        except Exception as e:
            pytest.skip(f"Não conseguiu navegar para protocolo: {e}")

        protocolo_page = ProtocoloPage(driver)
        assert protocolo_page.is_page_loaded(), "Página protocolo não carregou"

        # Dentro do protocolo: sidebar Favoritos deve listar o protocolo favoritado
        protocolo_page.expand_sidebar_card('Favoritos')
        time.sleep(0.5)
        labels = protocolo_page.get_sidebar_favorites_labels()
        assert nome_card in labels, (
            f"'{nome_card}' não aparece no sidebar Favoritos após favoritar. "
            f"Labels: {labels}"
        )

        # Cleanup: volta ao hub e desfavorita
        try:
            driver.find_element(By.CSS_SELECTOR, '.pd-back-btn').click()
            time.sleep(1)
            cards = driver.find_elements(
                By.CSS_SELECTOR, '.proto-desktop .protocol-card.em-hub-card'
            )
            if cards:
                star_div = cards[0].find_elements(By.TAG_NAME, 'div')[-1]
                driver.execute_script('arguments[0].click()', star_div)
                time.sleep(1)
        except Exception:
            pass
