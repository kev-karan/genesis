import os
import time
import pytest
import requests
from dotenv import load_dotenv
from selenium import webdriver
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from webdriver_manager.firefox import GeckoDriverManager
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from pages.login_page import LoginPage

load_dotenv()

BASE_URL = os.getenv("E2E_BASE_URL", "http://localhost:3000")
API_BASE_URL = os.getenv("E2E_API_URL", "http://localhost:8000/api")
TEST_EMAIL = os.getenv("E2E_TEST_EMAIL", "teste_e2e@genesis.com")
TEST_PASSWORD = os.getenv("E2E_TEST_PASSWORD", "senha_teste_123")


def requests_retry_session(retries=5, backoff_factor=0.5, status_forcelist=(500, 502, 503, 504)):
    """Create requests session with automatic retry strategy."""
    session = requests.Session()
    retry = Retry(
        total=retries,
        read=retries,
        connect=retries,
        backoff_factor=backoff_factor,
        status_forcelist=status_forcelist,
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount("http://", adapter)
    session.mount("https://", adapter)
    return session


@pytest.fixture(scope="session", autouse=True)
def setup_test_user():
    """Cria user de teste se não existir com retry."""
    max_retries = 60
    retry_delay = 2
    session = requests_retry_session()

    for attempt in range(max_retries):
        try:
            response = session.post(
                f"{API_BASE_URL}/auth/cadastro/",
                json={
                    "email": TEST_EMAIL,
                    "password": TEST_PASSWORD,
                    "confirmPassword": TEST_PASSWORD
                },
                timeout=10
            )
            if response.status_code == 201:
                print(f"\nUser teste criado: {TEST_EMAIL}")
            elif response.status_code == 400:
                print(f"\nUser teste já existe: {TEST_EMAIL}")
            else:
                print(f"\nAviso ao criar user: {response.status_code}")
            break
        except requests.exceptions.RequestException as e:
            print(f"Tentativa {attempt + 1}/{max_retries}: Aguardando backend... ({str(e)[:50]})")
            if attempt == max_retries - 1:
                print(f"\nNao conseguiu criar user teste após {max_retries} tentativas")
                print(f"Erro final: {e}")
                print("Backend disponível em " + API_BASE_URL)
            else:
                time.sleep(retry_delay)
        finally:
            session.close()
            session = requests_retry_session()


@pytest.fixture(scope="session")
def driver():
    """Cria driver Firefox headless para toda a sessão."""
    options = webdriver.FirefoxOptions()
    options.add_argument("--headless")
    options.add_argument("--width=1280")
    options.add_argument("--height=1024")

    service = Service(GeckoDriverManager().install())
    drv = webdriver.Firefox(service=service, options=options)

    drv.implicitly_wait(10)
    yield drv
    drv.quit()


@pytest.fixture
def logged_in(driver):
    """Fixa driver já autenticado na página Home."""
    max_wait = 60
    start_time = time.time()

    # Aguarda frontend estar disponível
    while time.time() - start_time < max_wait:
        try:
            driver.get(BASE_URL)
            break
        except Exception as e:
            if time.time() - start_time >= max_wait:
                raise
            print(f"Aguardando frontend em {BASE_URL}...")
            time.sleep(2)

    login_page = LoginPage(driver)
    login_page.enter_email(TEST_EMAIL)
    login_page.enter_password(TEST_PASSWORD)
    login_page.submit()

    # Espera Home carregar
    WebDriverWait(driver, 10).until(
        lambda d: "3000" in d.current_url
    )

    yield driver

    # Limpa estado
    driver.execute_script("localStorage.clear()")


@pytest.fixture
def reset_caso(setup_test_user):
    """Limpa RespostaUsuario do usuário de teste antes de cada teste de estudo."""
    session = requests_retry_session()
    try:
        resp = session.post(
            f"{API_BASE_URL}/auth/login/",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
            timeout=10,
        )
        token = resp.json().get("token")
        if token:
            session.delete(
                f"{API_BASE_URL}/casos/respostas/",
                headers={"Authorization": f"Token {token}"},
                timeout=10,
            )
    except Exception as e:
        print(f"\nAviso: reset_caso falhou: {e}")
    finally:
        session.close()
    yield


@pytest.fixture
def clean_driver(driver):
    """Limpa localStorage antes de cada teste e aguarda frontend."""
    max_wait = 60
    start_time = time.time()

    # Aguarda frontend estar disponível
    while time.time() - start_time < max_wait:
        try:
            driver.get(BASE_URL)
            break
        except Exception:
            if time.time() - start_time >= max_wait:
                raise
            time.sleep(2)

    try:
        driver.execute_script("localStorage.clear()")
    except Exception:
        pass
    driver.delete_all_cookies()
    yield driver
