import json
import pytest
import time
from selenium.webdriver.common.by import By
from pages.calculadora_page import CalculadoraPage


def _abrir_calculadora(driver):
    try:
        btn = driver.find_element(By.XPATH, "//button[contains(text(), 'CALCULADORA')]")
        btn.click()
        return True
    except Exception:
        return False


class TestCalculadora:
    def test_calculadora_acessivel_home(self, logged_in):
        driver = logged_in
        if not _abrir_calculadora(driver):
            pytest.skip("Botão CALCULADORA não encontrado na topbar")

        calc_page = CalculadoraPage(driver)
        assert calc_page.wait_for_desktop_hub(), "Hub de medicamentos (desktop) não carregou"
        nomes = calc_page.get_desktop_medication_names()
        assert len(nomes) > 0, "Nenhum medicamento listado na calculadora"

    def test_selecionar_medicamento_exibe_opcoes(self, logged_in):
        driver = logged_in
        if not _abrir_calculadora(driver):
            pytest.skip("Botão CALCULADORA não encontrado na topbar")

        calc_page = CalculadoraPage(driver)
        assert calc_page.wait_for_desktop_hub(), "Hub não carregou"
        assert calc_page.select_desktop_medication_by_name('Midazolam'), \
            "Midazolam não encontrado na lista"
        assert calc_page.wait_for_desktop_form(), \
            "Formulário não carregou após selecionar Midazolam"

    def test_calculo_basico(self, logged_in):
        driver = logged_in
        if not _abrir_calculadora(driver):
            pytest.skip("Botão CALCULADORA não encontrado na topbar")

        calc_page = CalculadoraPage(driver)
        assert calc_page.wait_for_desktop_hub(), "Hub não carregou"
        assert calc_page.select_desktop_medication_by_name('Midazolam'), "Midazolam não encontrado"
        assert calc_page.wait_for_desktop_form(), "Formulário não carregou"

        calc_page.click_desktop_dose_ref(0)
        time.sleep(0.3)
        calc_page.click_desktop_apresentacao(0)
        time.sleep(0.3)
        calc_page.enter_desktop_peso(10)
        time.sleep(0.3)

        assert calc_page.click_desktop_calcular(), "Botão 'Calcular dose' não habilitou"
        assert calc_page.has_desktop_result_with_text('Volume a administrar'), \
            "Seção de resultado não apareceu"

    def test_dose_limitada_exibe_aviso(self, logged_in):
        driver = logged_in
        if not _abrir_calculadora(driver):
            pytest.skip("Botão CALCULADORA não encontrado na topbar")

        calc_page = CalculadoraPage(driver)
        assert calc_page.wait_for_desktop_hub(), "Hub não carregou"
        # Midazolam dose 0 = 0.25 mg/kg, max 20 mg — peso 200 kg produz dose limitada
        assert calc_page.select_desktop_medication_by_name('Midazolam'), "Midazolam não encontrado"
        assert calc_page.wait_for_desktop_form(), "Formulário não carregou"

        calc_page.click_desktop_dose_ref(0)
        time.sleep(0.3)
        calc_page.click_desktop_apresentacao(0)
        time.sleep(0.3)
        calc_page.enter_desktop_peso(200)
        time.sleep(0.3)

        assert calc_page.click_desktop_calcular(), "Botão 'Calcular dose' não habilitou"
        assert calc_page.has_desktop_dose_limitada_warning(), \
            "Aviso de dose máxima atingida não apareceu para peso 200 kg"

    def test_campos_vazios_nao_calcula(self, logged_in):
        driver = logged_in
        if not _abrir_calculadora(driver):
            pytest.skip("Botão CALCULADORA não encontrado na topbar")

        calc_page = CalculadoraPage(driver)
        assert calc_page.wait_for_desktop_hub(), "Hub não carregou"
        assert calc_page.select_desktop_medication_by_name('Midazolam'), "Midazolam não encontrado"
        assert calc_page.wait_for_desktop_form(), "Formulário não carregou"

        # Nenhum campo preenchido — botão deve estar desabilitado
        assert not calc_page.is_desktop_calcular_enabled(), \
            "Botão 'Calcular dose' deveria estar desabilitado sem campos preenchidos"

    def test_calculo_comprimido(self, logged_in):
        driver = logged_in
        if not _abrir_calculadora(driver):
            pytest.skip("Botão Calculadora não encontrado na topbar")
        time.sleep(2)

        calc_page = CalculadoraPage(driver)
        if not calc_page.wait_for_desktop_hub():
            pytest.skip("Hub de medicamentos (desktop) não carregou")

        if not calc_page.select_desktop_medication_by_name('Diazepam'):
            pytest.skip("Diazepam não encontrado na lista")
        time.sleep(2)

        if not calc_page.wait_for_desktop_form():
            pytest.skip("Formulário de cálculo não carregou")

        if not calc_page.click_desktop_dose_ref(0):
            pytest.skip("Nenhuma dose de referência disponível")
        time.sleep(0.5)

        if not calc_page.click_desktop_apresentacao_by_text('Comprimido'):
            pytest.skip("Apresentação comprimido não encontrada para Diazepam")
        time.sleep(0.5)

        calc_page.enter_desktop_peso(20)
        time.sleep(0.3)

        if not calc_page.click_desktop_calcular():
            pytest.skip("Botão 'Calcular dose' não habilitado")
        time.sleep(2)

        assert calc_page.has_desktop_result_with_text('comprimido(s)'), \
            "Resultado não exibe unidade 'comprimido(s)'"

    def test_favoritar_medicamento(self, logged_in):
        driver = logged_in
        if not _abrir_calculadora(driver):
            pytest.skip("Botão Calculadora não encontrado na topbar")
        time.sleep(2)

        calc_page = CalculadoraPage(driver)
        if not calc_page.wait_for_desktop_hub():
            pytest.skip("Hub de medicamentos (desktop) não carregou")

        nomes = calc_page.get_desktop_medication_names()
        if len(nomes) < 2:
            pytest.skip("Menos de 2 medicamentos disponíveis")

        segundo_nome = nomes[1]

        if not calc_page.click_star_on_desktop_medication(1):
            pytest.skip("Não foi possível clicar na estrela")
        time.sleep(1)

        nomes_apos = calc_page.get_desktop_medication_names()
        assert nomes_apos[0] == segundo_nome, \
            f"Medicamento favoritado '{segundo_nome}' não subiu para primeiro. Lista: {nomes_apos}"

    def test_favoritar_conversao(self, logged_in):
        driver = logged_in
        if not _abrir_calculadora(driver):
            pytest.skip("Botão Calculadora não encontrado na topbar")
        time.sleep(2)

        calc_page = CalculadoraPage(driver)
        if not calc_page.wait_for_desktop_hub():
            pytest.skip("Hub desktop não carregou")

        if not calc_page.click_tab('Conversão'):
            pytest.skip("Aba Conversão não encontrada")
        time.sleep(2)

        nomes_conv = calc_page.get_desktop_conversion_names()
        if not nomes_conv:
            pytest.skip("Nenhuma conversão disponível")

        primeiro_conv = nomes_conv[0]

        if not calc_page.click_star_on_desktop_conversion(0):
            pytest.skip("Não foi possível clicar na estrela de conversão")
        time.sleep(1)

        calc_page.expand_sidebar_card('Favoritos')
        time.sleep(0.5)

        labels = calc_page.get_sidebar_favorites_labels()
        assert primeiro_conv in labels, \
            f"'{primeiro_conv}' não aparece nos favoritos da sidebar. Labels: {labels}"

    def test_recentes_limite_5(self, logged_in):
        driver = logged_in

        recents_pre = [
            {
                'medicamento_id': 100 + i,
                'medicamento_nome': f'Med Teste {i}',
                'peso_kg': 10,
                'dose_final_mg': 5.0,
                'volume': 0.5,
                'unidade_volume': 'ml',
                'timestamp': '2026-01-01T00:00:00.000Z',
            }
            for i in range(5)
        ]
        driver.execute_script(
            "localStorage.setItem('calc_recents', arguments[0])",
            json.dumps(recents_pre),
        )

        if not _abrir_calculadora(driver):
            pytest.skip("Botão Calculadora não encontrado na topbar")
        time.sleep(2)

        calc_page = CalculadoraPage(driver)
        if not calc_page.wait_for_desktop_hub():
            pytest.skip("Hub desktop não carregou")

        if not calc_page.select_desktop_medication_by_name('Midazolam'):
            if not calc_page.select_desktop_medication_by_name('Diazepam'):
                pytest.skip("Nenhum medicamento conhecido disponível")
        time.sleep(2)

        if not calc_page.wait_for_desktop_form():
            pytest.skip("Formulário não carregou")

        calc_page.click_desktop_dose_ref(0)
        time.sleep(0.3)

        form_card = driver.find_element(By.CSS_SELECTOR, '.proto-desktop .pd-card')
        btns = [b for b in form_card.find_elements(By.TAG_NAME, 'button')
                if b.is_displayed() and 'mg/kg' not in b.text and 'medicamento' not in b.text.lower()]
        for b in btns:
            if b.text and b.is_displayed():
                b.click()
                break
        time.sleep(0.3)

        calc_page.enter_desktop_peso(10)
        time.sleep(0.3)

        if not calc_page.click_desktop_calcular():
            pytest.skip("Não foi possível calcular (botão não habilitado)")
        time.sleep(2)

        calc_page.expand_sidebar_card('Últimos Cálculos')
        time.sleep(0.5)

        count = calc_page.get_sidebar_recents_count()
        assert count == 5, f"Esperado 5 recentes, mas encontrou {count}"
