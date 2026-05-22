import os
import pytest
from dotenv import load_dotenv
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from webdriver_manager.chrome import ChromeDriverManager
from pages.login_page import LoginPage

load_dotenv(dotenv_path="../.env")

BASE_URL = os.getenv("E2E_BASE_URL", "http://localhost:3000")
TEST_EMAIL = os.getenv("E2E_TEST_EMAIL", "teste_e2e@genesis.com")
TEST_PASSWORD = os.getenv("E2E_TEST_PASSWORD", "senha_teste_123")


@pytest.fixture(scope="session")
def driver():
    """Cria driver Chrome headless para toda a sessão."""
    options = webdriver.ChromeOptions()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--start-maximized")

    drv = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=options
    )
    drv.implicitly_wait(10)
    yield drv
    drv.quit()


@pytest.fixture
def logged_in(driver):
    """Fixa driver já autenticado na página Home."""
    driver.get(BASE_URL)

    login_page = LoginPage(driver)
    login_page.enter_email(TEST_EMAIL)
    login_page.enter_password(TEST_PASSWORD)
    login_page.submit()

    # Espera Home carregar
    WebDriverWait(driver, 10).until(
        lambda d: "http://localhost:3000" in d.current_url
    )

    yield driver

    # Limpa estado
    driver.execute_script("localStorage.clear()")


@pytest.fixture
def clean_driver(driver):
    """Limpa localStorage antes de cada teste."""
    driver.execute_script("localStorage.clear()")
    driver.delete_all_cookies()
    yield driver
