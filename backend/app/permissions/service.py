from typing import List

ROLE_HIERARCHY = {
    "ADMIN": ["TIER_1", "TIER_2", "TIER_3"],
    "TIER_1": ["TIER_1", "TIER_2", "TIER_3"],
    "TIER_2": ["TIER_2", "TIER_3"],
    "TIER_3": ["TIER_3"]
}

def get_allowed_tiers(role: str) -> List[str]:
    """
    Returns the list of tiers the given role is allowed to access.
    """
    return ROLE_HIERARCHY.get(role, [])

def can_access_tier(user_role: str, target_tier: str) -> bool:
    """
    Checks if a user role can access a specific target tier.
    """
    allowed_tiers = get_allowed_tiers(user_role)
    return target_tier in allowed_tiers
