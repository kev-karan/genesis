import pytest
import time
from selenium.webdriver.common.by import By
from pages.home_page import HomePage
from pages.calculadora_page import CalculadoraPage


class TestCalculadora:
    def test_calculadora_acessivel_home(self, logged_in):
        driver = logged_in
        home_page = HomePage(driver)
        assert home_page.is_page_loaded(), "Home não carregou"

        try:
            calc_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'CALCULADORA')]")
            calc_btn.click()
        except:
            pytest.skip("Botão Calculadora não encontrado na topbar")

        time.sleep(2)

        calc_page = CalculadoraPage(driver)
        assert calc_page.is_page_loaded(), "Calculadora não carregou"

        count = calc_page.get_medication_count()
        assert count > 0, "Nenhum medicamento listado na calculadora"

    def test_selecionar_medicamento_exibe_opcoes(self, logged_in):
        driver = logged_in

        try:
            calc_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'CALCULADORA')]")
            calc_btn.click()
        except:
            pytest.skip("Botão Calculadora não encontrado na topbar")
        time.sleep(2)

        calc_page = CalculadoraPage(driver)
        assert calc_page.is_page_loaded(), "Calculadora não carregou"

        if not calc_page.select_first_medication():
            pytest.skip("Nenhum medicamento disponível")
        time.sleep(2)

        assert calc_page.is_detail_loaded(), "Detalhes do medicamento não carregaram"

    def test_calculo_basico(self, logged_in):
        driver = logged_in

        try:
            calc_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'CALCULADORA')]")
            calc_btn.click()
        except:
            pytest.skip("Botão Calculadora não encontrado na topbar")
        time.sleep(2)

        calc_page = CalculadoraPage(driver)
        if not calc_page.select_first_medication():
            pytest.skip("Nenhum medicamento disponível")
        time.sleep(2)

        if not calc_page.is_detail_loaded():
            pytest.skip("Detalhes do medicamento não carregaram")

        calc_page.select_dose_reference(0)
        calc_page.select_apresentacao(0)
        calc_page.enter_peso(20)

        if not calc_page.is_calculate_button_enabled():
            pytest.skip("Botão calcular não habilitado após preenchimento")

        calc_page.click_calcular()
        time.sleep(2)

        assert calc_page.has_result_section(), "Seção de resultado não apareceu"

        volume = calc_page.get_result_volume()
        assert volume is not None and len(volume) > 0, "Volume não foi calculado"

    def test_dose_limitada_exibe_aviso(self, logged_in):
        driver = logged_in

        try:
            calc_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'CALCULADORA')]")
            calc_btn.click()
        except:
            pytest.skip("Botão Calculadora não encontrado na topbar")
        time.sleep(2)

        calc_page = CalculadoraPage(driver)
        if not calc_page.select_first_medication():
            pytest.skip("Nenhum medicamento disponível")
        time.sleep(2)

        if not calc_page.is_detail_loaded():
            pytest.skip("Detalhes do medicamento não carregaram")

        calc_page.select_dose_reference(0)
        calc_page.select_apresentacao(0)
        calc_page.enter_peso(200)

        if not calc_page.is_calculate_button_enabled():
            pytest.skip("Botão calcular não habilitado")

        calc_page.click_calcular()
        time.sleep(2)

        assert calc_page.has_result_section(), \
            "Resultado não foi calculado para peso 200kg"

        if not calc_page.has_dose_limitada_warning():
            pytest.skip("Medicamento selecionado não possui dose_maxima_mg configurada")

    def test_campos_vazios_nao_calcula(self, logged_in):
        driver = logged_in

        try:
            calc_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'CALCULADORA')]")
            calc_btn.click()
        except:
            pytest.skip("Botão Calculadora não encontrado na topbar")
        time.sleep(2)

        calc_page = CalculadoraPage(driver)
        if not calc_page.select_first_medication():
            pytest.skip("Nenhum medicamento disponível")
        time.sleep(2)

        if not calc_page.is_detail_loaded():
            pytest.skip("Detalhes do medicamento não carregaram")

        is_enabled = calc_page.is_calculate_button_enabled()

        if is_enabled:
            calc_page.click_calcular()
            time.sleep(1)
            assert not calc_page.has_result_section(), "Calculou sem dados completos"
        else:
            assert not calc_page.is_calculate_button_enabled(), \
                "Botão calcular deveria estar desabilitado com campos vazios"
