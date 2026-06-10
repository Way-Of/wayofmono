# pip install lunar_python
import datetime
from lunar_python import Lunar, Solar

def get_cyber_divination_data(birth_year, birth_month, birth_day, birth_hour=0, birth_minute=0):
    """
     v2.1
    -  HTML 
    """
    
    # ---  () ---
    GAN_WU_XING = {"": "", "": "", "": "", "": "", "": "", "": "", "": "", "": "", "": "", "": ""}
    ZHI_WU_XING = {"": "", "": "", "": "", "": "", "": "", "": "", "": "", "": "", "": "", "": "", "": "", "": ""}
    RELATIONSHIP = {
        "": {"": "", "": "", "": "", "": "", "": ""},
        "": {"": "", "": "", "": "", "": "", "": ""},
        "": {"": "", "": "", "": "", "": "", "": ""},
        "": {"": "", "": "", "": "", "": "", "": ""},
        "": {"": "", "": "", "": "", "": "", "": ""}
    }
    TEN_GODS = {
        "_": " (Friend)", "_": " (Rob)",
        "_": " (Artist)", "_": " (Rebel)",
        "_": " (Windfall)", "_": " (Salary)",
        "_": " (7-Killings)", "_": " (Officer)",
        "_": " (Owl)", "_": " (Seal)"
    }

    # --- 1.  ---
    solar = Solar.fromYmdHms(birth_year, birth_month, birth_day, birth_hour, birth_minute, 0)
    lunar = Lunar.fromSolar(solar)
    ba_zi = lunar.getEightChar()
    day_master = ba_zi.getDayGan()
    dm_element = GAN_WU_XING[day_master]
    dm_yin_yang = "" if day_master in ["", "", "", "", ""] else ""

    # --- 2.  ---
    def get_ten_god(target_gan):
        if not target_gan: return ""
        target_element = GAN_WU_XING.get(target_gan) or ZHI_WU_XING.get(target_gan)
        rel = RELATIONSHIP[dm_element].get(target_element, "")
        
        # 
        target_yy = "" if target_gan in ["", "", "", "", "", "", "", "", ""] else ""
        is_same = (dm_yin_yang == target_yy)
        key = f"{'' if is_same else ''}_{rel if rel in ['','','',''] else ''}"
        return TEN_GODS.get(key, "")

    # --- 3.  ---
    score = 0
    month_zhi = ba_zi.getMonthZhi()
    m_ele = ZHI_WU_XING[month_zhi]
    
    #  (+40)
    if RELATIONSHIP[dm_element][m_ele] in ["", ""]: score += 40
    elif RELATIONSHIP[dm_element][m_ele] == "": score -= 20
    
    #  (+15/each)
    for zhi in [ba_zi.getYearZhi(), ba_zi.getDayZhi(), ba_zi.getTimeZhi()]:
        if ZHI_WU_XING[zhi] == dm_element: score += 15
        
    body_strength = " (Strong)" if score >= 40 else " (Weak)"
    strength_cn = "" if score >= 40 else ""

    # --- 4.  ---
    current_year = datetime.datetime.now().year
    #  (，)
    # ： Lunar 
    current_lunar = Lunar.fromYmd(current_year, 6, 1)
    annual_gan = current_lunar.getYearGan()
    annual_zhi = current_lunar.getYearZhi()
    
    annual_god = get_ten_god(annual_gan)

    return {
        "meta": {
            "solar_date": f"{birth_year}-{birth_month}-{birth_day}",
            "lunar_date": f"{lunar.getYearInChinese()}{lunar.getMonthInChinese()}{lunar.getDayInChinese()}"
        },
        "bazi": {
            "day_master": day_master,
            "element": dm_element,
            "strength": strength_cn,
            "score": score
        },
        "fortune": {
            "current_year": f"{current_year} ({annual_gan}{annual_zhi})",
            "year_god": annual_god.split(" ")[0], # ， ""
            "lucky_direction": lunar.getDayPositionCaiDesc() # 
        }
    }