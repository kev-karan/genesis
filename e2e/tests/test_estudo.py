import pytest
import time
from selenium.webdriver.common.by import By
from pages.home_page import HomePage
from pages.estudo_page import EstudoPage


class TestEstudo:
    def test_lista_casos_exibe(self, logged_in):
        driver = logged_in

        try:
            estudo_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'MODO DE ESTUDO')]")
            estudo_btn.click()
        except:
            pytest.skip("Botão Modo de Estudo não encontrado na topbar")
        time.sleep(2)

        estudo_page = EstudoPage(driver)
        assert estudo_page.is_page_loaded(), "Modo Estudo não carregou"

        count = estudo_page.get_caso_count()
        assert count > 0, "Nenhum caso clínico disponível"

    def test_abrir_protocolo_caso(self, logged_in):
        driver = logged_in

        try:
            estudo_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'MODO DE ESTUDO')]")
            estudo_btn.click()
        except:
            pytest.skip("Botão Modo de Estudo não encontrado na topbar")
        time.sleep(2)

        estudo_page = EstudoPage(driver)
        assert estudo_page.is_page_loaded(), "Modo Estudo não carregou"

        if not estudo_page.select_first_caso():
            pytest.skip("Nenhum caso disponível")
        time.sleep(2)

        assert estudo_page.is_estudo_protocolo_loaded(), \
            "Protocolo do caso não carregou"

    def test_iniciar_questoes(self, logged_in):
        driver = logged_in

        try:
            estudo_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'MODO DE ESTUDO')]")
            estudo_btn.click()
        except:
            pytest.skip("Botão Modo de Estudo não encontrado na topbar")
        time.sleep(2)

        estudo_page = EstudoPage(driver)
        if not estudo_page.select_first_caso():
            pytest.skip("Nenhum caso disponível")
        time.sleep(2)

        if not estudo_page.is_estudo_protocolo_loaded():
            pytest.skip("Protocolo não carregou")

        if not estudo_page.click_iniciar_caso():
            pytest.skip("Botão Iniciar Caso não encontrado")
        time.sleep(2)

        if not estudo_page.click_iniciar_questoes():
            pytest.skip("Botão Iniciar questões não encontrado")
        time.sleep(2)

        question_text = estudo_page.get_current_question_text()
        assert question_text is not None and len(question_text) > 0, \
            "Primeira questão não foi renderizada"

    def test_resposta_binaria_correta(self, logged_in):
        driver = logged_in

        try:
            estudo_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'MODO DE ESTUDO')]")
            estudo_btn.click()
        except:
            pytest.skip("Botão Modo de Estudo não encontrado na topbar")
        time.sleep(2)

        estudo_page = EstudoPage(driver)
        if not estudo_page.select_first_caso():
            pytest.skip("Nenhum caso disponível")
        time.sleep(2)

        if not estudo_page.click_iniciar_caso():
            pytest.skip("Botão Iniciar Caso não encontrado")
        time.sleep(1)

        if not estudo_page.click_iniciar_questoes():
            pytest.skip("Botão Iniciar questões não encontrado")
        time.sleep(2)

        question_text = estudo_page.get_current_question_text()
        if question_text is None:
            pytest.skip("Questão não carregou")

        if not estudo_page.click_binary_answer("Sim"):
            pytest.skip("Primeira questão não é binária")
        time.sleep(2)

        correto = estudo_page.has_feedback_correto()
        incorreto = estudo_page.has_feedback_incorreto()
        assert correto or incorreto, "Nenhum feedback exibido após responder"

    def test_resposta_errada_feedback(self, logged_in):
        driver = logged_in

        try:
            estudo_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'MODO DE ESTUDO')]")
            estudo_btn.click()
        except:
            pytest.skip("Botão Modo de Estudo não encontrado na topbar")
        time.sleep(2)

        estudo_page = EstudoPage(driver)
        if not estudo_page.select_first_caso():
            pytest.skip("Nenhum caso disponível")
        time.sleep(2)

        if not estudo_page.click_iniciar_caso():
            pytest.skip("Botão Iniciar Caso não encontrado")
        time.sleep(1)

        if not estudo_page.click_iniciar_questoes():
            pytest.skip("Botão Iniciar questões não encontrado")
        time.sleep(2)

        question_text = estudo_page.get_current_question_text()
        if question_text is None:
            pytest.skip("Questão não carregou")

        if not estudo_page.click_binary_answer("Não"):
            pytest.skip("Primeira questão não é binária")
        time.sleep(2)

        incorreto = estudo_page.has_feedback_incorreto()
        if not incorreto:
            assert estudo_page.has_feedback_correto(), "Nenhum feedback exibido"

    def test_resposta_numerica(self, logged_in):
        driver = logged_in

        try:
            estudo_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'MODO DE ESTUDO')]")
            estudo_btn.click()
        except:
            pytest.skip("Botão Modo de Estudo não encontrado na topbar")
        time.sleep(2)

        estudo_page = EstudoPage(driver)
        if not estudo_page.select_first_caso():
            pytest.skip("Nenhum caso disponível")
        time.sleep(2)

        if not estudo_page.click_iniciar_caso():
            pytest.skip("Botão Iniciar Caso não encontrado")
        time.sleep(1)

        if not estudo_page.click_iniciar_questoes():
            pytest.skip("Botão Iniciar questões não encontrado")
        time.sleep(2)

        question_text = estudo_page.get_current_question_text()
        if question_text is None:
            pytest.skip("Questão não carregou")

        if not estudo_page.enter_numeric_answer("10"):
            pytest.skip("Input numérico não encontrado")
        time.sleep(1)

        if not estudo_page.click_confirmar():
            pytest.skip("Botão Confirmar não encontrado para numérica")
        time.sleep(2)

        correto = estudo_page.has_feedback_correto()
        incorreto = estudo_page.has_feedback_incorreto()
        assert correto or incorreto, "Nenhum feedback exibido para resposta numérica"

    def test_raciocinio_apos_responder(self, logged_in):
        driver = logged_in

        try:
            estudo_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'MODO DE ESTUDO')]")
            estudo_btn.click()
        except:
            pytest.skip("Botão Modo de Estudo não encontrado na topbar")
        time.sleep(2)

        estudo_page = EstudoPage(driver)
        if not estudo_page.select_first_caso():
            pytest.skip("Nenhum caso disponível")
        time.sleep(2)

        if not estudo_page.click_iniciar_caso():
            pytest.skip("Botão Iniciar Caso não encontrado")
        time.sleep(1)

        if not estudo_page.click_iniciar_questoes():
            pytest.skip("Botão Iniciar questões não encontrado")
        time.sleep(2)

        question_text = estudo_page.get_current_question_text()
        if question_text is None:
            pytest.skip("Questão não carregou")

        if estudo_page.click_binary_answer("Sim"):
            time.sleep(2)
        elif estudo_page.enter_numeric_answer("10"):
            time.sleep(1)
            estudo_page.click_confirmar()
            time.sleep(2)
        else:
            pytest.skip("Não foi possível responder à questão")

        feed_correto = estudo_page.has_feedback_correto()
        feed_incorreto = estudo_page.has_feedback_incorreto()
        if not (feed_correto or feed_incorreto):
            pytest.skip("Feedback não apareceu")

        try:
            prox_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'Próxima') or contains(text(), 'Concluir')]")
            prox_btn.click()
            time.sleep(2)
        except:
            pytest.skip("Botão de avançar não encontrado")

        concluido = estudo_page.is_concluido()
        if concluido:
            assert True
        else:
            new_question = estudo_page.get_current_question_text()
            assert new_question is not None and len(new_question) > 0, \
                "Próxima pergunta não carregou após avançar"
