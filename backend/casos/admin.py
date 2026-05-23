from django.contrib import admin
from .models import CasoClinico, Questao, OpcaoResposta, TelaResultado, PassoRaciocinio, RespostaUsuario


class QuestaoInline(admin.TabularInline):
    model = Questao
    extra = 1


class OpcaoRespostaInline(admin.TabularInline):
    model = OpcaoResposta
    extra = 2


class PassoRaciocinioInline(admin.TabularInline):
    model = PassoRaciocinio
    extra = 1


class TelaResultadoInline(admin.TabularInline):
    model = TelaResultado
    extra = 1


@admin.register(CasoClinico)
class CasoClinicoAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'nivel', 'ativo', 'criado_em')
    list_filter = ('nivel', 'ativo')
    search_fields = ('titulo', 'descricao')
    inlines = [QuestaoInline, TelaResultadoInline]


@admin.register(Questao)
class QuestaoAdmin(admin.ModelAdmin):
    list_display = ('caso_clinico', 'ordem', 'tipo')
    list_filter = ('tipo',)
    search_fields = ('enunciado', 'resposta_esperada')
    inlines = [OpcaoRespostaInline, PassoRaciocinioInline]


@admin.register(OpcaoResposta)
class OpcaoRespostaAdmin(admin.ModelAdmin):
    list_display = ('questao', 'ordem', 'texto', 'correta')
    list_filter = ('correta',)


@admin.register(TelaResultado)
class TelaResultadoAdmin(admin.ModelAdmin):
    list_display = ('caso_clinico', 'ordem', 'titulo')
    search_fields = ('titulo', 'conteudo')


@admin.register(PassoRaciocinio)
class PassoRaciocinioAdmin(admin.ModelAdmin):
    list_display = ('questao', 'ordem', 'titulo')
    search_fields = ('titulo', 'descricao')


@admin.register(RespostaUsuario)
class RespostaUsuarioAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'questao', 'correta', 'pontuacao', 'criada_em')
    list_filter = ('correta',)
    search_fields = ('usuario__username', 'resposta', 'feedback')