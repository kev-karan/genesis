def calcular_dose_mg(peso_kg: float, dose_mg_por_kg: float) -> float:
    return round(peso_kg * dose_mg_por_kg, 2)


def converter_mg_para_ml(dose_mg: float, concentracao_mg_por_ml: float) -> float:
    if concentracao_mg_por_ml <= 0:
        raise ValueError("Concentração deve ser maior que zero")
    return round(dose_mg / concentracao_mg_por_ml, 2)


def converter_mg_para_gotas(
    dose_mg: float,
    concentracao_mg_por_ml: float,
    gotas_por_ml: float = 20.0,
) -> float:
    ml = converter_mg_para_ml(dose_mg, concentracao_mg_por_ml)
    return round(ml * gotas_por_ml, 1)


def calcular_conversao(tipo: str, dose: float, fator: float, peso_kg: float | None = None) -> float:
    if tipo == 'peso':
        return round(dose * peso_kg * fator, 2)
    return round(dose * fator, 2)


def calcular_dose_completa(
    peso_kg: float,
    dose_mg_por_kg: float,
    dose_maxima_mg: float | None,
    concentracao_mg_por_ml: float,
    apresentacao: str = "ml",
    gotas_por_ml: float = 20.0,
) -> dict:
    dose_calculada_mg = calcular_dose_mg(peso_kg, dose_mg_por_kg)

    if dose_maxima_mg is not None:
        dose_limitada = dose_calculada_mg > dose_maxima_mg
        dose_final_mg = min(dose_calculada_mg, dose_maxima_mg)
    else:
        dose_limitada = False
        dose_final_mg = dose_calculada_mg

    if apresentacao == "gotas":
        dose_final_volume = converter_mg_para_gotas(
            dose_final_mg, concentracao_mg_por_ml, gotas_por_ml
        )
    else:
        dose_final_volume = converter_mg_para_ml(
            dose_final_mg, concentracao_mg_por_ml
        )

    return {
        "dose_calculada_mg": dose_calculada_mg,
        "dose_final_mg": dose_final_mg,
        "dose_limitada": dose_limitada,
        "volume": dose_final_volume,
        "unidade_volume": apresentacao,
        "concentracao_usada_mg_por_ml": concentracao_mg_por_ml,
    }
