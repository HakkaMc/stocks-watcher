# Algoritmus
* Zadat order do DB
* Sledovat dane crypto. Od proražení idealBuyPrice sledovat low a jde-li cena od 
  low zase nahoru (řešit nějakým procentem), tak koupit. Pokud se cena stihne 
  dřív přiblížit k buyPriceLimit a neudělá nižší low, tak hned koupit.
* Ihned vytvořit stopLoss a takeProfit order (OCO) v Binance.
* Prorazí-li cena trailingStopPrice, tak pokud se vrátí na hranici 
  trailingStopPriceLimit, tak hned prodat.
  

# Notifikace
* Take profit
* Stop loss
* Nákup se nezdaří
* Prodej se nezdaří


