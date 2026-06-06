def calcular_dose_mg(peso_kg: float, dose_mg_por_kg: float) -> float:

    return round(peso_kg * dose_mg_por_kg, 2)

def converter_mg_para_ml(dose_mg: float, concentracao_mg_por_ml: float) ->float:
    if concentracao_mg_por_ml <= 0:
        raise ValueError("Concentracão deve ser maior que zero")
    
    return round(dose_mg / concentracao_mg_por_ml, 2)

def converter_mg_para_gotas(dose_mg:float, concentracao_mg_por_ml:float,gotas_por_ml: float =20.0 ) ->float:
    ml =converter_mg_para_ml(dose_mg, concentracao_mg_por_ml)
    return round(ml * gotas_por_ml,1 )

def calcular_dose_completa(
        peso_kg: float,
        dose_mg_por_kg:float,
        dose_maxima_mg:float,
        concentracao_mg_por_ml:float,
        apresentacao: str='ml', #ml ou gotas
        gotas_por_ml: float = 20.0
) ->dict:
    
    #calcula dose pelo peso
    dose_calculada_mg = calcular_dose_mg(peso_kg, dose_mg_por_kg)
    
    #aplica limite da dose maxima
    dose_limita = dose_calculada_mg > dose_maxima_mg
    dose_final_mg = min(dose_calculada_mg, dose_maxima_mg)

    #converter para a apresentaçao correta
    if apresentacao == 'gotas':
           dose_final_volume = converter_mg_para_gotas(
                dose_final_mg, concentracao_mg_por_ml, gotas_por_ml
        )
    else:
        dose_final_volume = converter_mg_para_ml(
            dose_final_mg, concentracao_mg_por_ml
        )

    return {
        'dose_calculada_mg':dose_calculada_mg,
        'dose_final_mg': dose_final_mg,
        'dose_limitada': dose_limita,
        'volume':dose_final_volume,
        'unidade_volume':apresentacao,
        'concentracao_usada_mg_por_ml':concentracao_mg_por_ml,
    }


    