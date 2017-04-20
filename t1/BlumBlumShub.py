class BlumBlumShub:
	# Inicializa o algoritmo com o tamanho desejado
	# dos valores gerados e uma semente.
	def __init__(self, size, seed):
		# Primos de Mersenne usados como base para o parâmetro M.
		# Ambas as condições necessárias são cumpridas, isto é:
		# 	p e q são congruentes a 3 (mod 4)
		#	mdc(phi(p), phi(q)) é pequeno (6)
		if size < 128:
			p = (2 ** 107) - 1
			q = (2 ** 127) - 1
		else:
			p = (2 ** 2203) - 1
			q = (2 ** 4253) - 1

		# Calcula o parâmetro M do algoritmo.
		self.m = p * q

		# Evita que a semente assuma os valores 0 ou 1.
		seed = max(2, seed)

		# Garante que o valor da semente seja co-primo a M.
		# (como 'p' e 'q' são ímpares, uma semente par será
		# garantidamente coprima a ambos e, portanto, a M)
		if seed % 2 == 1:
			seed += 1

		# Armazena a semente inicial e o tamanho desejado.
		self.seed = seed
		self.size = size

	# Gera um novo valor aleatório e o retorna.
	def generate(self):
		self.seed = (self.seed * self.seed) % self.m
		# Obtém os N bits menos significativos da nova semente,
		# onde N é o tamanho desejado, e retorna sua
		# representação decimal.
		return self.seed & ((2 ** self.size) - 1)
