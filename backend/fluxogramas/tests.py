from django.test import TestCase
from rest_framework.test import APIClient
from fluxogramas.models import Fluxograma


class FluxogramaListTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.fluxo1 = Fluxograma.objects.create(
            titulo='Protocol A',
            descricao='Description for Protocol A',
            conteudo={'steps': [{'titulo': 'Step 1'}]}
        )
        self.fluxo2 = Fluxograma.objects.create(
            titulo='Protocol B',
            descricao='Description for Protocol B',
            conteudo={'steps': [{'titulo': 'Step 2'}]}
        )
        self.fluxo3 = Fluxograma.objects.create(
            titulo='Dengue Treatment',
            descricao='Dengue fever treatment protocol',
            conteudo={'steps': []}
        )

    def test_list_all_fluxogramas(self):
        response = self.client.get('/api/fluxogramas/')

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data['resultados']), 3)

    def test_search_by_titulo(self):
        response = self.client.get('/api/fluxogramas/?busca=Protocol%20A')

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data['resultados']), 1)
        self.assertEqual(data['resultados'][0]['titulo'], 'Protocol A')

    def test_search_by_descricao(self):
        response = self.client.get('/api/fluxogramas/?busca=Dengue')

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data['resultados']), 1)
        self.assertEqual(data['resultados'][0]['titulo'], 'Dengue Treatment')

    def test_search_case_insensitive(self):
        response = self.client.get('/api/fluxogramas/?busca=protocol%20a')

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data['resultados']), 1)

    def test_search_no_results(self):
        response = self.client.get('/api/fluxogramas/?busca=Nonexistent')

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data['resultados']), 0)

    def test_sem_autenticacao_pode_listar(self):
        response = APIClient().get('/api/fluxogramas/')

        self.assertEqual(response.status_code, 200)


class FluxogramaDetailTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.fluxo = Fluxograma.objects.create(
            titulo='Protocol A',
            descricao='Description A',
            conteudo={'steps': [{'titulo': 'Step 1', 'descricao': 'Do this'}]}
        )

    def test_get_fluxograma_detail(self):
        response = self.client.get(f'/api/fluxogramas/{self.fluxo.id}/')

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['titulo'], 'Protocol A')
        self.assertEqual(data['id'], self.fluxo.id)
        self.assertIn('conteudo', data)
        self.assertEqual(data['conteudo']['steps'][0]['titulo'], 'Step 1')

    def test_get_nonexistent_fluxograma(self):
        response = self.client.get('/api/fluxogramas/99999/')

        self.assertEqual(response.status_code, 404)

    def test_sem_autenticacao_pode_ver_detalhe(self):
        response = APIClient().get(f'/api/fluxogramas/{self.fluxo.id}/')

        self.assertEqual(response.status_code, 200)

    def test_conteudo_json_preservado(self):
        conteudo = {'passos': [{'id': 1, 'texto': 'Avaliar', 'filhos': []}], 'meta': {'versao': 2}}
        fluxo = Fluxograma.objects.create(titulo='Teste JSON', descricao='', conteudo=conteudo)

        response = APIClient().get(f'/api/fluxogramas/{fluxo.id}/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['conteudo'], conteudo)
