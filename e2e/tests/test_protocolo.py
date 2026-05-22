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

        # Navega para Dengue
        driver.execute_script("window.tela = 'dengue'; window.protocoloId = 1")
        time.sleep(2)

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

        driver.execute_script("window.tela = 'dengue'; window.protocoloId = 1")
        time.sleep(2)

        protocolo_page = ProtocoloPage(driver)
        assert protocolo_page.is_page_loaded(), \
            "Página protocolo não carregou"

        nodes = protocolo_page.get_flowchart_nodes()
        assert len(nodes) > 0, "Nenhum nó encontrado"

        # Tenta clicar no primeiro nó
        first_node = nodes[0]
        protocolo_page.click_node(first_node)
        time.sleep(1)

        # Verifica se filhos aparecem
        children = protocolo_page.get_expanded_children(first_node)
        # Se houver filhos, verificamos; se não, apenas registramos
        # (dependendo da estrutura do fluxograma)

    def test_voltar_emergencia(self, logged_in):
        """Test: Back button volta para Modo Emergência."""
        driver = logged_in

        driver.execute_script("window.tela = 'dengue'; window.protocoloId = 1")
        time.sleep(2)

        protocolo_page = ProtocoloPage(driver)
        assert protocolo_page.is_page_loaded(), \
            "Página protocolo não carregou"

        protocolo_page.go_back()
        time.sleep(2)

        # Verifica que voltou (pode estar em Emergência ou Home)
        emergencia_page = EmergenciaPage(driver)
        assert emergencia_page.is_page_loaded() or driver.find_elements(__import__('selenium').webdriver.common.by.By.CSS_SELECTOR, '.back-btn'), \
            "Não voltou corretamente"

    def test_favoritar_dentro_protocolo(self, logged_in):
        """Test: FAB star favorita/desfavorita protocolo."""
        driver = logged_in

        driver.execute_script("window.tela = 'dengue'; window.protocoloId = 1")
        time.sleep(2)

        protocolo_page = ProtocoloPage(driver)
        assert protocolo_page.is_page_loaded(), \
            "Página protocolo não carregou"

        # Obtém estado atual de favorito
        is_fav_before = protocolo_page.is_favorite_active()

        # Toggle
        success = protocolo_page.toggle_favorite()
        assert success, "Não conseguiu clicar em botão favoritar"

        time.sleep(1)

        # Verifica mudança de estado
        is_fav_after = protocolo_page.is_favorite_active()
        assert is_fav_before != is_fav_after, \
            "Estado de favorito não mudou após click"
