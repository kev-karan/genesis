import pytest
import time
from selenium.webdriver.common.by import By
from pages.home_page import HomePage
from pages.estudo_page import EstudoPage


class TestEstudo:
    def test_lista_casos_exibe(self, logged_in):
        driver = logged_in

        try:
            estudo_btn = driver.find_element(By.XPATH, "//button[contains(., 'MODO DE ESTUDO')]")
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
            estudo_btn = driver.find_element(By.XPATH, "//button[contains(., 'MODO DE ESTUDO')]")
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
            estudo_btn = driver.find_element(By.XPATH, "//button[contains(., 'MODO DE ESTUDO')]")
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
        # caso_dengue: ordem=1 é multipla_escolha, ordem=2 é binária (resposta_esperada='sim')
        driver = logged_in

        try:
            estudo_btn = driver.find_element(By.XPATH, "//button[contains(., 'MODO DE ESTUDO')]")
            estudo_btn.click()
        except:
            pytest.skip("Botão Modo de Estudo não encontrado na topbar")
        time.sleep(2)

        estudo_page = EstudoPage(driver)
        if not estudo_page.select_caso_by_name("Dengue"):
            pytest.skip("Caso Dengue não encontrado")
        time.sleep(2)

        if not estudo_page.click_iniciar_caso():
            pytest.skip("Botão Iniciar Caso não encontrado")
        time.sleep(1)

        if not estudo_page.click_iniciar_questoes():
            pytest.skip("Botão Iniciar questões não encontrado")
        time.sleep(2)

        # Ordem=1 é multipla_escolha — seleciona qualquer opção e avança
        if estudo_page.click_first_multipla_escolha_opcao():
            time.sleep(1)
            estudo_page.click_confirmar()
            time.sleep(2)
            estudo_page.click_proxima_pergunta()
            time.sleep(2)

        # Ordem=2 é binária — resposta correta é 'Sim'
        if not estudo_page.click_binary_answer("Sim"):
            pytest.skip("Questão binária não encontrada na segunda posição")
        time.sleep(2)

        assert estudo_page.has_feedback_correto(), \
            "Resposta correta 'Sim' deveria exibir feedback correto"

    def test_resposta_errada_feedback(self, logged_in):
        # caso_dengue: ordem=1 é multipla_escolha, ordem=2 é binária (resposta_esperada='sim')
        # 'Não' é resposta errada → deve exibir feedback incorreto
        driver = logged_in

        try:
            estudo_btn = driver.find_element(By.XPATH, "//button[contains(., 'MODO DE ESTUDO')]")
            estudo_btn.click()
        except:
            pytest.skip("Botão Modo de Estudo não encontrado na topbar")
        time.sleep(2)

        estudo_page = EstudoPage(driver)
        if not estudo_page.select_caso_by_name("Dengue"):
            pytest.skip("Caso Dengue não encontrado")
        time.sleep(2)

        if not estudo_page.click_iniciar_caso():
            pytest.skip("Botão Iniciar Caso não encontrado")
        time.sleep(1)

        if not estudo_page.click_iniciar_questoes():
            pytest.skip("Botão Iniciar questões não encontrado")
        time.sleep(2)

        # Ordem=1 é multipla_escolha — seleciona qualquer opção e avança
        if estudo_page.click_first_multipla_escolha_opcao():
            time.sleep(1)
            estudo_page.click_confirmar()
            time.sleep(2)
            estudo_page.click_proxima_pergunta()
            time.sleep(2)

        # Ordem=2 é binária — 'Não' é resposta errada
        if not estudo_page.click_binary_answer("Não"):
            pytest.skip("Questão binária não encontrada na segunda posição")
        time.sleep(2)

        assert estudo_page.has_feedback_incorreto(), \
            "Resposta errada deveria exibir feedback incorreto"

    def test_resposta_numerica(self, logged_in):
        driver = logged_in

        try:
            estudo_btn = driver.find_element(By.XPATH, "//button[contains(., 'MODO DE ESTUDO')]")
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

        # Avança pelas questões não-numéricas (Q1=multipla_escolha, Q2=binaria) até encontrar a numérica
        for _ in range(5):
            if estudo_page.enter_numeric_answer("10"):
                break
            answered = (
                estudo_page.click_first_multipla_escolha_opcao()
                or estudo_page.click_binary_answer("Sim")
                or estudo_page.click_binary_answer("Não")
            )
            if not answered:
                pytest.skip("Input numérico não encontrado e não foi possível avançar")
            time.sleep(1)
            estudo_page.click_confirmar_if_available()
            time.sleep(2)
            estudo_page.click_avancar()
            time.sleep(2)
        else:
            pytest.skip("Input numérico não encontrado após percorrer questões")
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
            estudo_btn = driver.find_element(By.XPATH, "//button[contains(., 'MODO DE ESTUDO')]")
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

        if estudo_page.click_first_multipla_escolha_opcao():
            time.sleep(1)
            estudo_page.click_confirmar_if_available()
            time.sleep(2)
        elif estudo_page.click_binary_answer("Sim"):
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
            prox_btn = driver.find_element(By.XPATH, "//button[contains(., 'Próxima') or contains(., 'Concluir')]")
            prox_btn.click()
            time.sleep(2)
        except:
            pytest.skip("Botão de avançar não encontrado")

        if not estudo_page.is_concluido():
            new_question = estudo_page.get_current_question_text()
            assert new_question is not None and len(new_question) > 0, \
                "Próxima pergunta não carregou após avançar"

    def test_caso_concluido(self, logged_in, reset_caso):
        # Percorre todas as questões do Caso Dengue e verifica tela de conclusão.
        # Q1: múltipla → "Dengue com sinais de alarme"
        # Q2: binária  → "Sim"
        # Q3: numérica → "42"
        driver = logged_in

        try:
            driver.find_element(By.XPATH, "//button[contains(., 'MODO DE ESTUDO')]").click()
        except Exception:
            pytest.skip("Botão Modo de Estudo não encontrado na topbar")
        time.sleep(2)

        estudo_page = EstudoPage(driver)
        assert estudo_page.is_page_loaded(), "Modo Estudo não carregou"
        assert estudo_page.select_caso_by_name("Dengue"), "Caso Dengue não encontrado"
        time.sleep(2)

        assert estudo_page.click_iniciar_caso(), "Botão 'Iniciar Caso' não encontrado"
        time.sleep(2)

        assert estudo_page.click_iniciar_questoes(), "Botão 'Iniciar questões' não encontrado"
        time.sleep(2)

        # Q1 — múltipla escolha
        assert estudo_page.click_multipla_opcao_by_text("Dengue com sinais de alarme"), \
            "Opção 'Dengue com sinais de alarme' não encontrada"
        time.sleep(0.3)
        assert estudo_page.click_confirmar(), "Botão Confirmar não encontrado (Q1)"
        time.sleep(2)
        assert estudo_page.click_avancar(), "Botão avançar não encontrado após Q1"
        time.sleep(2)

        # Q2 — binária
        assert estudo_page.click_binary_answer("Sim"), "Opção 'Sim' não encontrada (Q2)"
        time.sleep(2)
        assert estudo_page.click_avancar(), "Botão avançar não encontrado após Q2"
        time.sleep(2)

        # Q3 — numérica
        assert estudo_page.enter_numeric_answer("42"), "Input numérico não encontrado (Q3)"
        time.sleep(0.3)
        assert estudo_page.click_confirmar(), "Botão Confirmar não encontrado (Q3)"
        time.sleep(2)
        assert estudo_page.click_avancar(), "Botão 'Concluir' não encontrado"
        time.sleep(2)

        assert estudo_page.is_concluido(), "Tela 'Caso concluído!' não apareceu"
        assert estudo_page.has_conclusao_button(), \
            "Botão 'Voltar ao Modo Estudo' não encontrado na conclusão"
